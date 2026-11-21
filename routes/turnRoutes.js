const express = require('express');
const db = require('../config/db');

const router = express.Router();

// Get active turn
router.get('/:room_id/current', async (req, res) => {
    const { room_id } = req.params;

    try {
        // Check whether the game has ended
        const [rooms] = await db.query(
            `SELECT status
             FROM Room
             WHERE room_id = ?`,
            [room_id]
        );

        if (rooms.length === 0) {
            return res.status(404).json({
                message: 'Room not found.'
            });
        }

        if (rooms[0].status === 'Completed') {
            return res.json(null);
        }

        // Get active turn for a living participant
        const [turns] = await db.query(
            `SELECT Turn.*, Participant.player_name,
                    Participant.hp, Participant.is_alive
             FROM Turn
             JOIN Participant
             ON Turn.participant_id = Participant.participant_id
             WHERE Turn.room_id = ?
             AND Turn.status = 'Active'
             AND Participant.hp > 0
             ORDER BY Turn.turn_order ASC
             LIMIT 1`,
            [room_id]
        );

        res.json(turns[0] || null);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Unable to retrieve turn.'
        });
    }
});

module.exports = router;
