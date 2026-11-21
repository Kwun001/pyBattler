const express = require('express');
const db = require('../config/db');

const router = express.Router();

// Get current participant
async function getParticipant(req, room_id) {
    if (req.session.user) {
        const [players] = await db.query(
            `SELECT * FROM Participant
             WHERE room_id = ? AND user_id = ?`,
            [room_id, req.session.user.user_id]
        );

        return players[0];
    }

    if (req.session.guest) {
        const [players] = await db.query(
            `SELECT * FROM Participant
             WHERE room_id = ? AND guest_id = ?`,
            [room_id, req.session.guest.guest_id]
        );

        return players[0];
    }

    return null;
}

// Display Scan Page
router.get('/:room_id', async (req, res) => {
    try {
        const { room_id } = req.params;

        const participant = await getParticipant(req, room_id);

        if (!participant) {
            return res.redirect('/rooms');
        }

        const [rooms] = await db.query(
            `SELECT status FROM Room
             WHERE room_id = ?`,
            [room_id]
        );

        if (rooms.length === 0 || rooms[0].status === 'Completed') {
            return res.redirect(`/game/${room_id}`);
        }

        if (Number(participant.hp) <= 0) {
            return res.redirect(`/game/${room_id}`);
        }

        res.render('scan', {
            title: 'Scan Card',
            room_id
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Unable to open the scan page.');
    }
});

// Scan physical card
router.post('/:room_id', async (req, res) => {
    const { room_id } = req.params;
    const { qr_code } = req.body;

    if (!qr_code) {
        return res.status(400).json({
            message: 'QR code is empty.'
        });
    }

    try {
        // Get current participant
        const participant = await getParticipant(req, room_id);

        if (!participant) {
            return res.status(403).json({
                message: 'You are not a participant in this room.'
            });
        }

        // Check whether the game has ended
        const [rooms] = await db.query(
            `SELECT status FROM Room
             WHERE room_id = ?`,
            [room_id]
        );

        if (rooms.length === 0 || rooms[0].status === 'Completed') {
            return res.status(400).json({
                message: 'The game has already ended.'
            });
        }

        // Eliminated players cannot use cards
        if (Number(participant.hp) <= 0) {
            return res.status(400).json({
                message: 'You are eliminated and cannot use cards.'
            });
        }

        // Prevent scanning another card before answering
        const selectedCard = req.session.selectedCard;

        if (
            selectedCard &&
            selectedCard.room_id === room_id &&
            selectedCard.participant_id === participant.participant_id
        ) {
            req.session.selectedCard = null;
            req.session.currentQuestion = null;
        }

        // Find the scanned card
        const [cards] = await db.query(
            `SELECT * FROM Card
             WHERE qr_code = ?`,
            [qr_code]
        );

        if (cards.length === 0) {
            return res.status(404).json({
                message: 'Invalid QR code. Card not found.'
            });
        }

        const card = cards[0];
        const cardType = card.card_type;

        // Reject Revive cards
        if (cardType === 'Revive') {
            return res.status(400).json({
                message: 'Revive cards are no longer available.'
            });
        }

        // Only Attack, Defense and Recovery are supported
        if (!['Attack', 'Defense', 'Recovery'].includes(cardType)) {
            return res.status(400).json({
                message: 'This card type is not supported.'
            });
        }

        // Check pending incoming attack
        const [pendingAttacks] = await db.query(
            `SELECT Action.*
             FROM Action
             JOIN Turn ON Action.turn_id = Turn.turn_id
             WHERE Action.target_participant_id = ?
             AND Action.action_status = 'Pending'
             AND Turn.room_id = ?
             AND Turn.status = 'Active'
             LIMIT 1`,
            [participant.participant_id, room_id]
        );

        const isDefending = pendingAttacks.length > 0;

        // Defense can only be used when an attack is pending
        if (cardType === 'Defense' && !isDefending) {
            return res.status(400).json({
                message: 'No attack is pending. You cannot use a Defense card.'
            });
        }

        // If under attack, only Defense is allowed
        if (isDefending && cardType !== 'Defense') {
            return res.status(400).json({
                message: 'You must use a Defense card to respond to the attack.'
            });
        }

        // Check whether the player has an active turn
        if (!isDefending) {
            const [activeTurns] = await db.query(
                `SELECT * FROM Turn
                 WHERE room_id = ?
                 AND participant_id = ?
                 AND status = 'Active'
                 LIMIT 1`,
                [room_id, participant.participant_id]
            );

            if (activeTurns.length === 0) {
                return res.status(400).json({
                    message: 'It is not your turn.'
                });
            }

            const turn = activeTurns[0];

            // Check whether an action has already been recorded for this turn
            const [existingActions] = await db.query(
                `SELECT action_id FROM Action
                 WHERE turn_id = ?
                 AND participant_id = ?
                 LIMIT 1`,
                [turn.turn_id, participant.participant_id]
            );

            if (existingActions.length > 0) {
                return res.status(400).json({
                    message: 'You have already used your card for this turn.'
                });
            }

            // Recovery is not allowed at full HP
            if (cardType === 'Recovery' &&
                Number(participant.hp) >= 100) {
                return res.status(400).json({
                    message: 'Your HP is already full. You cannot use a Recovery card.'
                });
            }

        } else {
            // Check whether this incoming attack already has a Defense response
            const attack = pendingAttacks[0];

            const [defenseActions] = await db.query(
                `SELECT action_id FROM Action
                 WHERE turn_id = ?
                 AND participant_id = ?
                 AND action_type = 'Defense'
                 LIMIT 1`,
                [attack.turn_id, participant.participant_id]
            );

            if (defenseActions.length > 0) {
                return res.status(400).json({
                    message: 'You have already responded to this attack.'
                });
            }
        }

        // Store selected card in session
        req.session.selectedCard = {
            card_id: card.card_id,
            card_type: cardType,
            card_description: card.card_description,
            room_id,
            participant_id: participant.participant_id
        };

        res.json({
            message: 'Card found.',
            card: req.session.selectedCard
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Unable to scan card.'
        });
    }
});

module.exports = router;
