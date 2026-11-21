const express = require('express');
const crypto = require('crypto');
const db = require('../config/db');

const router = express.Router();

// Generate Action ID
function generateActionId() {
    return 'A' + Date.now().toString(36).slice(-9).toUpperCase();
}

// Generate Turn ID
function generateTurnId() {
    return 'T' + crypto.randomBytes(5).toString('hex').slice(0, 9).toUpperCase();
}

// Check whether the game has ended
async function checkGameOver(connection, room_id) {
    // Lock the room
    const [rooms] = await connection.query(
        `SELECT * FROM Room
         WHERE room_id = ?
         FOR UPDATE`,
        [room_id]
    );

    if (rooms.length === 0) {
        throw new Error('Room not found.');
    }

    // Do not check an already completed game
    if (rooms[0].status === 'Completed') {
        return {
            game_over: true,
            winner_id: rooms[0].winner_id,
            winner_name: null,
            is_draw: rooms[0].winner_id === null
        };
    }

    // Keep alive status consistent with HP
    await connection.query(
        `UPDATE Participant
         SET is_alive = CASE
             WHEN hp > 0 THEN TRUE
             ELSE FALSE
         END
         WHERE room_id = ?`,
        [room_id]
    );

    // Get players whose HP is above 0
    const [alivePlayers] = await connection.query(
        `SELECT participant_id, player_name
         FROM Participant
         WHERE room_id = ?
         AND hp > 0`,
        [room_id]
    );

    // More than one player remains
    if (alivePlayers.length > 1) {
        return {
            game_over: false,
            winner_id: null,
            winner_name: null,
            is_draw: false
        };
    }

    // One player remains: winner
    // No players remain: draw
    const winner = alivePlayers.length === 1
        ? alivePlayers[0]
        : null;

    // Mark the room as completed
    await connection.query(
        `UPDATE Room
         SET status = 'Completed',
             winner_id = ?
         WHERE room_id = ?`,
        [
            winner ? winner.participant_id : null,
            room_id
        ]
    );

    // Complete the current round
    await connection.query(
        `UPDATE Game_Round
         SET status = 'Completed'
         WHERE room_id = ?
         AND round_number = ?`,
        [room_id, rooms[0].current_round]
    );

    // Stop all remaining turns
    await connection.query(
        `UPDATE Turn
         SET status = 'Completed'
         WHERE room_id = ?
         AND status IN ('Active', 'Waiting')`,
        [room_id]
    );

    // Get all participants and calculate final rankings
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
        [
            room_id,
            winner ? winner.participant_id : null
        ]
    );

    // Save final rankings
    for (let i = 0; i < participants.length; i++) {
        const leaderboardId =
            'L' + require('crypto').randomBytes(4).toString('hex');

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

    return {
        game_over: true,
        winner_id: winner ? winner.participant_id : null,
        winner_name: winner ? winner.player_name : null,
        is_draw: winner === null
    };
}

// Move to next turn or automatically start the next round
async function moveToNextTurn(connection, turn_id) {
    const [turns] = await connection.query(
        `SELECT * FROM Turn
         WHERE turn_id = ?
         FOR UPDATE`,
        [turn_id]
    );

    if (turns.length === 0) {
        throw new Error('Turn not found.');
    }

    const currentTurn = turns[0];

    // Prevent the same completed turn from creating another round
    if (currentTurn.status === 'Completed') {
        return;
    }

    // Lock the room to prevent duplicate round creation
    const [rooms] = await connection.query(
        `SELECT * FROM Room
         WHERE room_id = ?
         FOR UPDATE`,
        [currentTurn.room_id]
    );

    if (rooms.length === 0) {
        throw new Error('Room not found.');
    }

    // Stop if the game has already ended
    if (rooms[0].status === 'Completed') {
        return;
    }

    // Complete the current turn
    await connection.query(
        `UPDATE Turn
         SET status = 'Completed'
         WHERE turn_id = ?`,
        [turn_id]
    );

    // Find the next waiting turn belonging to a living player
    const [nextTurns] = await connection.query(
        `SELECT Turn.*
         FROM Turn
         JOIN Participant
           ON Turn.participant_id = Participant.participant_id
         WHERE Turn.room_id = ?
         AND Turn.round_number = ?
         AND Turn.turn_order > ?
         AND Turn.status = 'Waiting'
         AND Participant.hp > 0
         ORDER BY Turn.turn_order ASC
         LIMIT 1`,
        [
            currentTurn.room_id,
            currentTurn.round_number,
            currentTurn.turn_order
        ]
    );

    // Activate the next participant's turn
    if (nextTurns.length > 0) {
        await connection.query(
            `UPDATE Turn
             SET status = 'Active'
             WHERE turn_id = ?`,
            [nextTurns[0].turn_id]
        );

        return;
    }

    // Complete any remaining waiting turns of eliminated players
    await connection.query(
        `UPDATE Turn
         SET status = 'Completed'
         WHERE room_id = ?
         AND round_number = ?
         AND status = 'Waiting'`,
        [
            currentTurn.room_id,
            currentTurn.round_number
        ]
    );

    // Check whether another turn is still active
    const [activeTurns] = await connection.query(
        `SELECT turn_id FROM Turn
         WHERE room_id = ?
         AND round_number = ?
         AND status = 'Active'`,
        [
            currentTurn.room_id,
            currentTurn.round_number
        ]
    );

    if (activeTurns.length > 0) {
        return;
    }

    // All turns in the current round are completed
    await connection.query(
        `UPDATE Game_Round
         SET status = 'Completed'
         WHERE room_id = ?
         AND round_number = ?`,
        [
            currentTurn.room_id,
            currentTurn.round_number
        ]
    );

    // Create the next round
    const nextRoundNumber = currentTurn.round_number + 1;

    // Get only participants who are still alive
    const [participants] = await connection.query(
        `SELECT participant_id
         FROM Participant
         WHERE room_id = ?
         AND hp > 0
         ORDER BY participant_id ASC`,
        [currentTurn.room_id]
    );

    // Check game result before creating another round
    if (participants.length <= 1) {
        await checkGameOver(connection, currentTurn.room_id);
        return;
    }

    await connection.query(
        `INSERT INTO Game_Round
         (room_id, round_number, status)
         VALUES (?, ?, 'In Progress')`,
        [
            currentTurn.room_id,
            nextRoundNumber
        ]
    );

    // Update the room's current round
    await connection.query(
        `UPDATE Room
         SET current_round = ?
         WHERE room_id = ?`,
        [
            nextRoundNumber,
            currentTurn.room_id
        ]
    );

    // Create a new turn for every living participant
    for (let i = 0; i < participants.length; i++) {
        await connection.query(
            `INSERT INTO Turn
             (turn_id, room_id, round_number, participant_id,
              turn_order, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                generateTurnId(),
                currentTurn.room_id,
                nextRoundNumber,
                participants[i].participant_id,
                i + 1,
                i === 0 ? 'Active' : 'Waiting'
            ]
        );
    }
}

// Process card action
router.post('/process', async (req, res) => {
    const { answer, target_id } = req.body;

    const selectedCard = req.session.selectedCard;
    const currentQuestion = req.session.currentQuestion;

    if (!selectedCard || !currentQuestion) {
        return res.status(400).json({
            message: 'Invalid game session. Please scan your card again.'
        });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const { room_id, participant_id, card_id, card_type } = selectedCard;

        if (!answer) {
            throw new Error('Please select an answer.');
        }

        const correct = String(answer).trim() === String(currentQuestion.correct_answer).trim();

        // Retrieve participant
        const [players] = await connection.query(
            `SELECT * FROM Participant
             WHERE participant_id = ? AND room_id = ?
             FOR UPDATE`,
            [participant_id, room_id]
        );

        if (players.length === 0) {
            throw new Error('Participant not found.');
        }

        const player = players[0];

        // Check whether this is a Defense response
        const [pendingAttacks] = await connection.query(
            `SELECT Action.*, Turn.room_id
             FROM Action
             JOIN Turn ON Action.turn_id = Turn.turn_id
             WHERE Action.target_participant_id = ?
             AND Action.action_status = 'Pending'
             AND Turn.room_id = ?
             LIMIT 1
             FOR UPDATE`,
            [participant_id, room_id]
        );

        let success = false;
        let message = '';
        let gameResult = null;

        // DEFENSE
        if (card_type === 'Defense') {
            if (pendingAttacks.length === 0) {
                throw new Error('There is no pending attack to defend against.');
            }

            const attack = pendingAttacks[0];

            if (correct) {
                // Block attack
                success = true;

                await connection.query(
                    `UPDATE Participant
                     SET score = score + 10
                     WHERE participant_id = ?`,
                    [participant_id]
                );

                await connection.query(
                    `UPDATE Action
                     SET action_status = 'Completed',
                         success = FALSE
                     WHERE action_id = ?`,
                    [attack.action_id]
                );

                message = 'Attack blocked! You earned 10 points.';

            } else {
                // Attack lands
                await connection.query(
                    `UPDATE Participant
                     SET hp = GREATEST(hp - 10, 0),
                         is_alive = CASE
                             WHEN GREATEST(hp - 10, 0) = 0 THEN FALSE
                             ELSE TRUE
                         END
                     WHERE participant_id = ?`,
                    [participant_id]
                );

                await connection.query(
                    `UPDATE Participant
                     SET score = score + 10
                     WHERE participant_id = ?`,
                    [attack.participant_id]
                );

                await connection.query(
                    `UPDATE Action
                     SET action_status = 'Completed',
                         success = TRUE
                     WHERE action_id = ?`,
                    [attack.action_id]
                );

                message = 'Defense failed. You lost 10 HP.';

                // Check whether the game has ended
                gameResult = await checkGameOver(connection, room_id);
            }

            // Record Defense response
            await connection.query(
                `INSERT INTO Action
                 (action_id, turn_id, card_id, participant_id,
                  question_id, action_type, success,
                  target_participant_id, action_status)
                 VALUES (?, ?, ?, ?, ?, 'Defense', ?, ?, 'Completed')`,
                [
                    generateActionId(),
                    attack.turn_id,
                    card_id,
                    participant_id,
                    currentQuestion.question_id,
                    success,
                    attack.participant_id
                ]
            );

            // End attacker's turn if the game is not over
            if (!gameResult || !gameResult.game_over) {
                await moveToNextTurn(connection, attack.turn_id);
            }

        } else {
            // Other cards require the player's active turn
            const [turns] = await connection.query(
                `SELECT * FROM Turn
                 WHERE room_id = ?
                 AND participant_id = ?
                 AND status = 'Active'
                 LIMIT 1
                 FOR UPDATE`,
                [room_id, participant_id]
            );

            if (turns.length === 0) {
                throw new Error('It is not your turn.');
            }

            const turn = turns[0];

            // ATTACK
            if (card_type === 'Attack') {
                if (correct && target_id) {
                    const [targets] = await connection.query(
                        `SELECT * FROM Participant
                         WHERE participant_id = ?
                         AND room_id = ?
                         AND hp > 0
                         FOR UPDATE`,
                        [target_id, room_id]
                    );

                    if (targets.length === 0 ||
                        target_id === participant_id) {
                        throw new Error('Invalid attack target.');
                    }

                    // Create pending attack
                    await connection.query(
                        `INSERT INTO Action
                         (action_id, turn_id, card_id, participant_id,
                          question_id, action_type, success,
                          target_participant_id, action_status)
                         VALUES (?, ?, ?, ?, ?, 'Attack', FALSE, ?, 'Pending')`,
                        [
                            generateActionId(),
                            turn.turn_id,
                            card_id,
                            participant_id,
                            currentQuestion.question_id,
                            target_id
                        ]
                    );

                    await connection.commit();

                    req.session.selectedCard = null;
                    req.session.currentQuestion = null;

                    return res.json({
                        success: true,
                        pending: true,
                        message: 'Attack initiated. Waiting for the target to defend.',
                        game_url: `/game/${room_id}`
                    });

                } else if (correct) {
                    throw new Error('Please select an opponent to attack.');
                }
            }

            // RECOVERY
            else if (card_type === 'Recovery' && correct) {
                if (player.hp > 0 && player.hp < 100) {
                    await connection.query(
                        `UPDATE Participant
                         SET hp = LEAST(hp + 5, 100),
                             is_alive = TRUE,
                             score = score + 10
                         WHERE participant_id = ?`,
                        [participant_id]
                    );

                    success = true;
                }
            }

            // Record action
            await connection.query(
                `INSERT INTO Action
                 (action_id, turn_id, card_id, participant_id,
                  question_id, action_type, success,
                  target_participant_id, action_status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Completed')`,
                [
                    generateActionId(),
                    turn.turn_id,
                    card_id,
                    participant_id,
                    currentQuestion.question_id,
                    card_type,
                    success,
                    target_id || null
                ]
            );

            await moveToNextTurn(connection, turn.turn_id);

            message = !correct
                ? 'Incorrect answer. Your action failed.'
                : success
                    ? 'Action successful! You earned 10 points.'
                    : 'The action could not be performed.';
        }

        await connection.commit();

        req.session.selectedCard = null;
        req.session.currentQuestion = null;

        res.json({
            success,
            pending: false,
            message,
            game_over: gameResult ? gameResult.game_over : false,
            winner_id: gameResult ? gameResult.winner_id : null,
            winner_name: gameResult ? gameResult.winner_name : null,
            is_draw: gameResult ? gameResult.is_draw : false,
            game_url: `/game/${room_id}`
        });

    } catch (error) {
        await connection.rollback();
        console.error(error);

        res.status(400).json({
            message: error.message || 'Unable to process action.'
        });

    } finally {
        connection.release();
    }
});


// Accept an incoming attack without using a Defense card
router.post('/accept-attack/:room_id', async (req, res) => {
    const { room_id } = req.params;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        let participant = null;

        if (req.session.user) {
            const [players] = await connection.query(
                `SELECT * FROM Participant
                 WHERE room_id = ? AND user_id = ?
                 FOR UPDATE`,
                [room_id, req.session.user.user_id]
            );
            participant = players[0];
        } else if (req.session.guest) {
            const [players] = await connection.query(
                `SELECT * FROM Participant
                 WHERE room_id = ? AND guest_id = ?
                 FOR UPDATE`,
                [room_id, req.session.guest.guest_id]
            );
            participant = players[0];
        }

        if (!participant) {
            throw new Error('Participant not found in this room.');
        }

        const [attacks] = await connection.query(
            `SELECT Action.*, Turn.turn_id AS attack_turn_id
             FROM Action
             JOIN Turn ON Action.turn_id = Turn.turn_id
             WHERE Action.target_participant_id = ?
             AND Action.action_status = 'Pending'
             AND Turn.room_id = ?
             LIMIT 1
             FOR UPDATE`,
            [participant.participant_id, room_id]
        );

        if (attacks.length === 0) {
            throw new Error('There is no pending attack to accept.');
        }

        const attack = attacks[0];

        // Apply 10 HP damage to the attacked participant
        await connection.query(
            `UPDATE Participant
             SET hp = GREATEST(hp - 10, 0),
                 is_alive = CASE
                     WHEN GREATEST(hp - 10, 0) = 0 THEN FALSE
                     ELSE TRUE
                 END
             WHERE participant_id = ?`,
            [participant.participant_id]
        );

        // Award 10 points to the attacker because the attack landed
        await connection.query(
            `UPDATE Participant
             SET score = score + 10
             WHERE participant_id = ?`,
            [attack.participant_id]
        );

        // Complete the pending attack
        await connection.query(
            `UPDATE Action
             SET action_status = 'Completed', success = TRUE
             WHERE action_id = ?`,
            [attack.action_id]
        );

        // Check whether the game has ended
        const gameResult = await checkGameOver(connection, room_id);

        // Continue the game only if it has not ended
        if (!gameResult.game_over) {
            await moveToNextTurn(connection, attack.attack_turn_id);
        }

        await connection.commit();

        res.json({
            success: true,
            message: 'You accepted the attack and lost 10 HP.',
            game_over: gameResult.game_over,
            winner_id: gameResult.winner_id,
            winner_name: gameResult.winner_name,
            is_draw: gameResult.is_draw,
            game_url: `/game/${room_id}`
        });

    } catch (error) {
        await connection.rollback();
        console.error(error);

        res.status(400).json({
            message: error.message || 'Unable to accept the attack.'
        });

    } finally {
        connection.release();
    }
});


// Get latest game information for automatic frontend updates
router.get('/game-status/:room_id', async (req, res) => {
    try {
        const { room_id } = req.params;
        let currentParticipant = null;

        if (req.session.user) {
            const [players] = await db.query(
                `SELECT * FROM Participant
                 WHERE room_id = ? AND user_id = ?`,
                [room_id, req.session.user.user_id]
            );
            currentParticipant = players[0] || null;

        } else if (req.session.guest) {
            const [players] = await db.query(
                `SELECT * FROM Participant
                 WHERE room_id = ? AND guest_id = ?`,
                [room_id, req.session.guest.guest_id]
            );
            currentParticipant = players[0] || null;
        }

        if (!currentParticipant) {
            return res.status(403).json({
                message: 'Participant not found in this room.'
            });
        }

        const [rooms] = await db.query(
            `SELECT current_round, status, winner_id
             FROM Room
             WHERE room_id = ?`,
            [room_id]
        );

        const [participants] = await db.query(
            `SELECT participant_id, player_name, hp, score, is_alive
             FROM Participant
             WHERE room_id = ?
             ORDER BY participant_id`,
            [room_id]
        );

        const [actions] = await db.query(
            `SELECT COUNT(*) AS total
             FROM Action
             WHERE participant_id = ?
             AND success = TRUE`,
            [currentParticipant.participant_id]
        );

        let winner = null;

        if (rooms.length > 0 && rooms[0].winner_id) {
            const [winners] = await db.query(
                `SELECT participant_id, player_name
                 FROM Participant
                 WHERE participant_id = ?`,
                [rooms[0].winner_id]
            );

            winner = winners[0] || null;
        }

        res.json({
            current_round: rooms.length > 0 ? rooms[0].current_round : 1,
            game_over: rooms.length > 0 && rooms[0].status === 'Completed',
            winner_id: winner ? winner.participant_id : null,
            winner_name: winner ? winner.player_name : null,
            is_draw: rooms.length > 0 &&
                rooms[0].status === 'Completed' &&
                !rooms[0].winner_id,
            participants,
            current_participant_id: currentParticipant.participant_id,
            successful_actions: actions[0].total
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Unable to retrieve the latest game status.'
        });
    }
});


// Get pending Defense request for current participant
router.get('/pending-defense/:room_id', async (req, res) => {
    try {
        const { room_id } = req.params;
        let participant = null;

        if (req.session.user) {
            const [players] = await db.query(
                `SELECT * FROM Participant
                 WHERE room_id = ? AND user_id = ?`,
                [room_id, req.session.user.user_id]
            );
            participant = players[0];

        } else if (req.session.guest) {
            const [players] = await db.query(
                `SELECT * FROM Participant
                 WHERE room_id = ? AND guest_id = ?`,
                [room_id, req.session.guest.guest_id]
            );
            participant = players[0];
        }

        if (!participant) {
            return res.status(403).json({
                message: 'Participant not found.'
            });
        }

        const [attacks] = await db.query(
            `SELECT Action.action_id, Participant.player_name
             FROM Action
             JOIN Turn ON Action.turn_id = Turn.turn_id
             JOIN Participant
               ON Action.participant_id = Participant.participant_id
             WHERE Action.target_participant_id = ?
             AND Action.action_status = 'Pending'
             AND Turn.room_id = ?
             AND Turn.status = 'Active'
             LIMIT 1`,
            [participant.participant_id, room_id]
        );

        res.json({
            pending: attacks.length > 0,
            action_id: attacks.length > 0 ? attacks[0].action_id : null,
            attacker: attacks.length > 0
                ? attacks[0].player_name
                : null
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Unable to check pending attack.'
        });
    }
});

module.exports = router;
