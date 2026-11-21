const express = require('express');
const db = require('../config/db');
const crypto = require('crypto');

const router = express.Router();

// Display leaderboard
router.get('/:room_id', async (req, res) => {
    const { room_id } = req.params;

    try {
        // Get room information and winner
        const [rooms] = await db.query(
            `SELECT room_id, room_code, status, winner_id
             FROM Room
             WHERE room_id = ?`,
            [room_id]
        );

        if (rooms.length === 0) {
            return res.status(404).send('Room not found.');
        }

        const room = rooms[0];

        let participants;

        if (room.status === 'Completed') {
            // Get saved final rankings
            const [rankings] = await db.query(
                `SELECT
                    Participant.participant_id,
                    Participant.player_name,
                    Participant.score,
                    Participant.hp,
                    Participant.is_alive,
                    Leaderboard.rank
                 FROM Leaderboard
                 JOIN Participant
                   ON Leaderboard.participant_id =
                      Participant.participant_id
                 WHERE Leaderboard.room_id = ?
                 ORDER BY Leaderboard.rank ASC`,
                [room_id]
            );

            participants = rankings;

        } else {
            // Get current rankings while the game is in progress
            const [players] = await db.query(
                `SELECT participant_id, player_name, score, hp, is_alive
                 FROM Participant
                 WHERE room_id = ?
                 ORDER BY score DESC, hp DESC`,
                [room_id]
            );

            participants = players;
        }

        // Get winner information
        const winner = participants.find(function (participant) {
            return participant.participant_id === room.winner_id;
        }) || null;

        res.render('leaderboard', {
            room,
            room_id,
            participants,
            winner,
            isDraw: room.status === 'Completed' && !winner
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Unable to load leaderboard.');
    }
});


// Save leaderboard rankings
router.post('/:room_id/save', async (req, res) => {
    const { room_id } = req.params;
    let connection;

    try {
        connection = await db.getConnection();

        await connection.beginTransaction();

        const [rooms] = await connection.query(
            `SELECT status, winner_id
             FROM Room
             WHERE room_id = ?
             FOR UPDATE`,
            [room_id]
        );

        if (rooms.length === 0) {
            throw new Error('Room not found.');
        }

        if (rooms[0].status !== 'Completed') {
            throw new Error('The game has not ended yet.');
        }

        const [participants] = await connection.query(
            `SELECT participant_id
             FROM Participant
             WHERE room_id = ?
             ORDER BY
                CASE
                    WHEN participant_id = ? THEN 0
                    ELSE 1
                END,
                score DESC,
                hp DESC`,
            [room_id, rooms[0].winner_id]
        );

        // Remove previous rankings for this room
        await connection.query(
            `DELETE FROM Leaderboard
             WHERE room_id = ?`,
            [room_id]
        );

        // Insert updated rankings
        for (let i = 0; i < participants.length; i++) {
            const leaderboardId = 'L' + crypto.randomBytes(4).toString('hex');

            await connection.query(
                `INSERT INTO Leaderboard
                (leaderboard_id, room_id, participant_id, \`rank\`)
                VALUES (?, ?, ?, ?)`,
                [
                    leaderboardId,
                    room_id,
                    participants[i].participant_id,
                    i + 1
                ]
            );
        }

        await connection.commit();

        res.json({
            message: 'Leaderboard saved successfully.'
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error(error);

        res.status(400).json({
            message: error.message || 'Unable to save leaderboard.'
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
});

module.exports = router;
