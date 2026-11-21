
const express = require('express');
const db = require('../config/db');

const router = express.Router();

// Get available rooms
router.get('/', async (req, res) => {
    try {
        const [rooms] = await db.query(
            `SELECT Room.*,
                (SELECT COUNT(*)
                 FROM Participant
                 WHERE Participant.room_id = Room.room_id) AS player_count
             FROM Room
             WHERE status = 'Waiting'`
        );

        let joinErrorMessage = null;

        if (req.query.joinError === 'not_found') {
            joinErrorMessage = 'Room not found or no longer available.';
        } else if (req.query.joinError === 'full') {
            joinErrorMessage = 'This room is full. Please join another room.';
        } else if (req.query.joinError === 'invalid') {
            joinErrorMessage = 'Please enter a valid room code.';
        }

        res.render('rooms', {
            title: 'Rooms',
            rooms,
            joinErrorMessage,
            currentUser: req.session.user || null,
            sessionGuest: req.session.guest || null

        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Unable to load rooms.');
    }
});

// Create Room
router.post('/create', async (req, res) => {
    try {
        if (!req.session.user && !req.session.guest) {
            return res.redirect('/login');
        }

        const [ids] = await db.query(
            'SELECT room_id FROM Room ORDER BY room_id DESC LIMIT 1'
        );

        const nextId = ids.length > 0
            ? parseInt(ids[0].room_id.substring(1)) + 1
            : 1;

        const roomId = 'R' + String(nextId).padStart(4, '0');

        const roomCode = Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();

        let userId = null;
        let guestId = null;
        let playerName = '';

        if (req.session.user) {
            userId = req.session.user.user_id;
            playerName = req.session.user.username;
        } else if (req.session.guest) {
            guestId = req.session.guest.guest_id;
            playerName = req.session.guest.guest_name;
        }

        const [participantIds] = await db.query(
            'SELECT participant_id FROM Participant ORDER BY participant_id DESC LIMIT 1'
        );

        const nextParticipantId = participantIds.length > 0
            ? parseInt(participantIds[0].participant_id.substring(1)) + 1
            : 1;

        const participantId = 'P' + String(nextParticipantId).padStart(4, '0');

        await db.query(
            `INSERT INTO Room
             (room_id, room_code, status, max_players, current_round)
             VALUES (?, ?, 'Waiting', 4, 1)`,
            [roomId, roomCode]
        );

        await db.query(
            `INSERT INTO Participant
             (participant_id, room_id, user_id, guest_id,
              player_name, hp, score, is_alive)
             VALUES (?, ?, ?, ?, ?, 100, 0, TRUE)`,
            [participantId, roomId, userId, guestId, playerName]
        );

        res.redirect('/lobby/' + roomId);

    } catch (error) {
        console.error(error);
        res.status(500).send('Unable to create room.');
    }
});

// Join Room Using Room Code
router.post('/join', async (req, res) => {
    const roomCode = (req.body.room_code || '').trim().toUpperCase();

    try {
        if (!req.session.user && !req.session.guest) {
            return res.redirect('/login');
        }

        if (!roomCode) {
            return res.redirect('/rooms?joinError=invalid');
        }

        // Find room using room code
        const [rooms] = await db.query(
            `SELECT * FROM Room
             WHERE room_code = ?
             AND status = 'Waiting'`,
            [roomCode]
        );

        if (rooms.length === 0) {
            return res.redirect('/rooms?joinError=not_found');
        }

        const room = rooms[0];

        // Get player information
        let userId = null;
        let guestId = null;
        let playerName = '';

        if (req.session.user) {
            userId = req.session.user.user_id;
            playerName = req.session.user.username;
        } else if (req.session.guest) {
            guestId = req.session.guest.guest_id;
            playerName = req.session.guest.guest_name;
        }

        // Check whether player has already joined
        const [existing] = await db.query(
            `SELECT participant_id
             FROM Participant
             WHERE room_id = ?
             AND (
                (user_id = ? AND ? IS NOT NULL)
                OR
                (guest_id = ? AND ? IS NOT NULL)
             )`,
            [room.room_id, userId, userId, guestId, guestId]
        );

        if (existing.length > 0) {
            return res.redirect('/lobby/' + room.room_id);
        }

        // Count existing participants
        const [participants] = await db.query(
            `SELECT COUNT(*) AS total
             FROM Participant
             WHERE room_id = ?`,
            [room.room_id]
        );

        if (participants[0].total >= room.max_players) {
            return res.redirect('/rooms?joinError=full');
        }

        // Generate participant ID
        const [ids] = await db.query(
            'SELECT participant_id FROM Participant ORDER BY participant_id DESC LIMIT 1'
        );

        const nextId = ids.length > 0
            ? parseInt(ids[0].participant_id.substring(1)) + 1
            : 1;

        const participantId = 'P' + String(nextId).padStart(4, '0');

        // Add player to room
        await db.query(
            `INSERT INTO Participant
             (participant_id, room_id, user_id, guest_id,
              player_name, hp, score, is_alive)
             VALUES (?, ?, ?, ?, ?, 100, 0, TRUE)`,
            [participantId, room.room_id, userId, guestId, playerName]
        );

        res.redirect('/lobby/' + room.room_id);

    } catch (error) {
        console.error(error);
        res.status(500).send('Unable to join room.');
    }
});

module.exports = router;
