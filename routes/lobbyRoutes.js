const express = require('express');
const db = require('../config/db');
const crypto = require('crypto');

const router = express.Router();

// Get current player from session
async function getCurrentParticipant(room_id, req) {
    let query;
    let value;

    if (req.session.user) {
        query = `SELECT * FROM Participant
                 WHERE room_id = ? AND user_id = ?`;
        value = req.session.user.user_id;
    } else if (req.session.guest) {
        query = `SELECT * FROM Participant
                 WHERE room_id = ? AND guest_id = ?`;
        value = req.session.guest.guest_id;
    } else {
        return null;
    }

    const [players] = await db.query(query, [room_id, value]);
    return players[0] || null;
}

// Check room and get latest participants (used by lobby.js)
router.get('/:room_id/status', async (req, res) => {
    const { room_id } = req.params;

    try {
        const [rooms] = await db.query(
            'SELECT * FROM Room WHERE room_id = ?',
            [room_id]
        );

        if (rooms.length === 0) {
            return res.status(404).json({ message: 'Room not found.' });
        }

        const currentParticipant = await getCurrentParticipant(room_id, req);

        if (!currentParticipant) {
            return res.status(403).json({
                message: 'You are not a participant in this room.'
            });
        }

        const [participants] = await db.query(
            `SELECT participant_id, player_name
             FROM Participant
             WHERE room_id = ?
             ORDER BY participant_id`,
            [room_id]
        );

        res.json({
            status: rooms[0].status,
            participants,
            hostParticipantId: participants[0]?.participant_id,
            maxPlayers: rooms[0].max_players
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Unable to check room status.' });
    }
});

// Display Lobby
router.get('/:room_id', async (req, res) => {
    const { room_id } = req.params;

    try {
        const [rooms] = await db.query(
            'SELECT * FROM Room WHERE room_id = ?',
            [room_id]
        );

        if (rooms.length === 0) {
            return res.status(404).send('Room not found.');
        }

        // If the game has already started, enter the game directly
        if (rooms[0].status === 'In Progress') {
            return res.redirect('/game/' + room_id);
        }

        const [participants] = await db.query(
            `SELECT * FROM Participant
             WHERE room_id = ?
             ORDER BY participant_id`,
            [room_id]
        );

        const currentParticipant = await getCurrentParticipant(room_id, req);

        if (!currentParticipant) {
            return res.status(403).send('You are not a participant in this room.');
        }

        const hostParticipant = participants[0] || null;

        res.render('lobby', {
            title: 'Room Lobby',
            room: rooms[0],
            participants,
            currentParticipant,
            hostParticipant,
            isGuest: !!req.session.guest
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Unable to load lobby.');
    }
});

// Leave Room (lobby only)
router.post('/:room_id/leave', async (req, res) => {
    const { room_id } = req.params;

    try {
        const [rooms] = await db.query('SELECT * FROM Room WHERE room_id = ?', [room_id]);

        if (rooms.length === 0) {
            return res.redirect('/rooms');
        }

        if (rooms[0].status !== 'Waiting') {
            // Game already started — can't leave through this route
            return res.redirect('/game/' + room_id);
        }

        const currentParticipant = await getCurrentParticipant(room_id, req);

        if (currentParticipant) {
            await db.query('DELETE FROM Participant WHERE participant_id = ?', [currentParticipant.participant_id]);

            const [remaining] = await db.query(
                'SELECT COUNT(*) AS total FROM Participant WHERE room_id = ?',
                [room_id]
            );

            if (remaining[0].total === 0) {
                await db.query('DELETE FROM Room WHERE room_id = ?', [room_id]);
            }
        }

        res.redirect('/rooms');

    } catch (error) {
        console.error(error);
        res.status(500).send('Unable to leave room.');
    }
});

// Start Game
router.post('/:room_id/start', async (req, res) => {
    const { room_id } = req.params;
    let connection;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // Lock the room to prevent two players starting it simultaneously
        const [rooms] = await connection.query(
            'SELECT * FROM Room WHERE room_id = ? FOR UPDATE',
            [room_id]
        );

        if (rooms.length === 0) {
            await connection.rollback();
            return res.status(404).send('Room not found.');
        }

        // If another request has already started the game, enter it
        if (rooms[0].status === 'In Progress') {
            await connection.commit();
            return res.redirect('/game/' + room_id);
        }

        if (rooms[0].status !== 'Waiting') {
            await connection.rollback();
            return res.status(400).send('This game cannot be started.');
        }

        const [participants] = await connection.query(
            `SELECT * FROM Participant
             WHERE room_id = ?
             ORDER BY participant_id`,
            [room_id]
        );

        const currentParticipant = await getCurrentParticipant(room_id, req);

        if (!currentParticipant) {
            await connection.rollback();
            return res.status(403).send('You are not a participant in this room.');
        }

        // Only the host can start the game
        if (participants[0].participant_id !== currentParticipant.participant_id) {
            await connection.rollback();
            return res.status(403).send('Only the room host can start the game.');
        }

        if (participants.length < 2) {
            await connection.rollback();
            return res.status(400).send('At least 2 players are required.');
        }

        // Create first game round
        const roundNumber = rooms[0].current_round || 1;

        await connection.query(
            `INSERT INTO Game_Round (room_id, round_number, status)
             VALUES (?, ?, 'In Progress')`,
            [room_id, roundNumber]
        );

        // Create turns for all participants
        for (let i = 0; i < participants.length; i++) {
            const turnId = 'T' + crypto.randomBytes(5).toString('hex').slice(0, 9);

            await connection.query(
                `INSERT INTO Turn
                 (turn_id, room_id, round_number,
                  participant_id, turn_order, status)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    turnId,
                    room_id,
                    roundNumber,
                    participants[i].participant_id,
                    i + 1,
                    i === 0 ? 'Active' : 'Waiting'
                ]
            );
        }

        // Update room status
        await connection.query(
            `UPDATE Room
             SET status = 'In Progress'
             WHERE room_id = ?`,
            [room_id]
        );

        await connection.commit();

        res.redirect('/game/' + room_id);

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error(error);
        res.status(500).send('Unable to start game.');

    } finally {
        if (connection) {
            connection.release();
        }
    }
});

module.exports = router;