
const express = require('express');
const db = require('../config/db');

const router = express.Router();

// Display game results
router.get('/:room_id', async (req, res) => {
    const { room_id } = req.params;

    try {
        // Check whether the room exists
        const [rooms] = await db.query(
            'SELECT room_id FROM Room WHERE room_id = ?',
            [room_id]
        );

        if (rooms.length === 0) {
            return res.status(404).send('Room not found.');
        }

        // Get all participants in the room
        const [participants] = await db.query(
            `SELECT participant_id, user_id, guest_id,
                    player_name, hp, score, is_alive
             FROM Participant
             WHERE room_id = ?
             ORDER BY score DESC, hp DESC`,
            [room_id]
        );

        if (participants.length === 0) {
            return res.status(404).send('No participants found.');
        }

        // Identify the current participant
        let currentParticipant = null;

        if (req.session.user) {
            currentParticipant = participants.find(
                participant =>
                    participant.user_id === req.session.user.user_id
            );
        } else if (req.session.guest) {
            currentParticipant = participants.find(
                participant =>
                    participant.guest_id === req.session.guest.guest_id
            );
        }

        // Get current participant's ranking
        let currentRank = null;

        if (currentParticipant) {
            currentRank = participants.findIndex(
                participant =>
                    participant.participant_id === currentParticipant.participant_id
            ) + 1;
        }

        res.render('result', {
            title: 'Battle Results',
            participants,
            currentParticipant,
            currentRank,
            room_id
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Unable to load game results.');
    }
});

module.exports = router;
