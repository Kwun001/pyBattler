const express = require('express');
const db = require('../config/db');

const router = express.Router();

// Display Game
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

        let currentParticipant = null;

        if (req.session.user) {
            const [players] = await db.query(
                `SELECT * FROM Participant
                 WHERE room_id = ? AND user_id = ?`,
                [room_id, req.session.user.user_id]
            );

            currentParticipant = players[0] || null;
        } else if (req.session.guest) {
            const guestId = req.session.guest.guest_id;

            const [players] = await db.query(
                `SELECT * FROM Participant
                 WHERE room_id = ? AND guest_id = ?`,
                [room_id, guestId]
            );

            currentParticipant = players[0] || null;
        }

        if (!currentParticipant) {
            return res.status(403).send('You are not a participant in this room.');
        }

        // Clear unanswered card question when returning to the game
        if (
            req.session.selectedCard &&
            req.session.selectedCard.room_id === room_id &&
            req.session.selectedCard.participant_id === currentParticipant.participant_id
        ) {
            req.session.selectedCard = null;
            req.session.currentQuestion = null;
        }

        const [participants] = await db.query(
            `SELECT * FROM Participant
             WHERE room_id = ?
             ORDER BY participant_id`,
            [room_id]
        );

        const [actions] = await db.query(
            `SELECT COUNT(*) AS total
             FROM Action
             WHERE participant_id = ? AND success = TRUE`,
            [currentParticipant.participant_id]
        );

        const aliveCount = participants.filter(
            participant => participant.is_alive
        ).length;

        res.render('game', {
            title: 'Game',
            room: rooms[0],
            participants,
            currentParticipant,
            successfulActions: actions[0].total,
            aliveCount
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Unable to load game.');
    }
});

module.exports = router;