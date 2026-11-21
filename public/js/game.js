document.addEventListener('DOMContentLoaded', function () {
    const gameShell = document.querySelector('.game-shell');

    if (!gameShell) {
        return;
    }

    const roomId = gameShell.dataset.roomId;
    const participantId = gameShell.dataset.participantId;

    const turnStatus = document.getElementById('turnStatus');
    const incomingPopup = document.getElementById('incomingAttackPopup');
    const incomingMessage = document.getElementById('incomingAttackMessage');
    const defendButton = document.getElementById('defendAttackButton');
    const acceptButton = document.getElementById('acceptAttackButton');

    // Game result popup
    const gameResultPopup = document.getElementById('gameResultPopup');
    const gameResultTitle = document.getElementById('gameResultTitle');
    const gameResultMessage = document.getElementById('gameResultMessage');
    const gameResultDetails = document.getElementById('gameResultDetails');

    // Remove the old bottom attack message if it exists.
    const oldDefenseNotice = document.getElementById('defenseNotice');

    if (oldDefenseNotice) {
        oldDefenseNotice.remove();
    }

    let currentPendingAttackId = null;
    let isAcceptingAttack = false;
    let isUpdating = false;
    let isGameOver = false;

    function showIncomingAttack(attacker) {
        if (!incomingPopup || !incomingMessage) {
            return;
        }

        incomingMessage.textContent = attacker +
            ' is attacking you. Scan a Defense card or accept the attack.';

        incomingPopup.classList.add('show');
        incomingPopup.setAttribute('aria-hidden', 'false');
    }

    function hideIncomingAttack() {
        if (!incomingPopup) {
            return;
        }

        incomingPopup.classList.remove('show');
        incomingPopup.setAttribute('aria-hidden', 'true');
    }

    // Display the game result to every participant
    function showGameResult(status) {
        if (isGameOver) {
            return;
        }

        isGameOver = true;

        hideIncomingAttack();

        if (turnStatus) {
            turnStatus.textContent = 'Game Over';
        }

        if (!gameResultPopup) {
            return;
        }

        if (status.is_draw) {
            gameResultTitle.textContent = 'Game Draw!';
            gameResultMessage.textContent = 'The game has ended in a draw.';
            gameResultDetails.textContent = 'All players have been eliminated.';
        } else {
            const winner = status.participants.find(function (player) {
                return player.participant_id === status.winner_id;
            });

            const winnerName = status.winner_name ||
                (winner ? winner.player_name : 'Unknown');

            if (status.winner_id === participantId) {
                gameResultTitle.textContent = 'You Win!';
                gameResultMessage.textContent = 'Congratulations! You are the last player standing.';
            } else {
                gameResultTitle.textContent = 'Game Over';
                gameResultMessage.textContent = 'You have lost the game.';
            }

            gameResultDetails.textContent = 'Winner: ' + winnerName;
        }

        gameResultPopup.classList.add('show');
        gameResultPopup.setAttribute('aria-hidden', 'false');
    }

    // Update each player's HP, score and alive status
    function updateParticipantDisplay(participant) {
        const playerCard = document.querySelector(
            '[data-player-id="' + participant.participant_id + '"]'
        );

        if (!playerCard) {
            return;
        }

        const hp = Number(participant.hp);
        const isAlive = hp > 0;

        const hpNumber = playerCard.querySelector('.hp-number-value');
        const hpBar = playerCard.querySelector('.hp-track span');
        const statusNote = playerCard.querySelector('.player-status-note');

        if (hpNumber) {
            hpNumber.textContent = hp;
        }

        if (hpBar) {
            hpBar.style.width = Math.max(0, Math.min(100, hp)) + '%';
        }

        if (statusNote) {
            statusNote.textContent = isAlive ? '' : 'Eliminated';
            statusNote.style.display = isAlive ? 'none' : 'block';
        }

        const scoreValue = playerCard.querySelector('.player-score-value');

        if (scoreValue) {
            scoreValue.textContent = participant.score;
        }

        playerCard.classList.toggle('eliminated-card', !isAlive);
    }

    async function updateGameStatus() {
        if (isUpdating || isGameOver) {
            return;
        }

        isUpdating = true;

        try {
            // Get current game status
            const statusResponse = await fetch(
                `/action/game-status/${roomId}`,
                { cache: 'no-store' }
            );

            const status = await statusResponse.json();

            if (!statusResponse.ok) {
                throw new Error(status.message || 'Unable to retrieve game status.');
            }

            // Update every participant's display
            status.participants.forEach(updateParticipantDisplay);

            // Update round number
            const roundLabel = document.querySelector('.match-meta .round-pill');
            const roundNumber = document.querySelector('.turn-number');

            if (roundLabel) {
                roundLabel.textContent = 'ROUND ' + status.current_round;
            }

            if (roundNumber) {
                roundNumber.textContent = status.current_round;
            }

            // Update current player's score
            const scoreValue = document.getElementById('myScore');

            if (scoreValue) {
                const me = status.participants.find(function (player) {
                    return player.participant_id === participantId;
                });

                if (me) {
                    scoreValue.textContent = me.score;
                }
            }

            // Update successful actions
            const actionsValue = document.getElementById('successfulActions');

            if (actionsValue) {
                actionsValue.textContent = status.successful_actions;
            }

            // Update alive player count
            const aliveValue = document.getElementById('aliveCount');

            if (aliveValue) {
                const alive = status.participants.filter(function (player) {
                    return Number(player.hp) > 0;
                }).length;

                aliveValue.textContent = alive + '/' + status.participants.length;
            }

            // Check whether the game has ended
            if (status.game_over) {
                showGameResult(status);
                return;
            }

            // Update active turn
            const turnResponse = await fetch(`/turn/${roomId}/current`, {
                cache: 'no-store'
            });

            const turn = await turnResponse.json();

            if (turnStatus) {
                if (turn) {
                    turnStatus.textContent =
                        turn.participant_id === participantId
                            ? 'It is your turn!'
                            : turn.player_name + "'s turn";
                } else {
                    turnStatus.textContent = 'No active turn.';
                }
            }

            // Check for incoming attacks
            const defenseResponse = await fetch(
                `/action/pending-defense/${roomId}`,
                { cache: 'no-store' }
            );

            const defense = await defenseResponse.json();

            if (defense.pending) {
                if (currentPendingAttackId !== defense.action_id) {
                    currentPendingAttackId = defense.action_id;
                    showIncomingAttack(defense.attacker);
                }
            } else {
                currentPendingAttackId = null;
                hideIncomingAttack();
            }

        } catch (error) {
            console.error('Unable to update game status:', error);
        } finally {
            isUpdating = false;
        }
    }

    // Accept incoming attack
    if (acceptButton) {
        acceptButton.addEventListener('click', async function () {
            if (isAcceptingAttack || isGameOver) {
                return;
            }

            isAcceptingAttack = true;
            acceptButton.disabled = true;
            acceptButton.textContent = 'Processing...';

            try {
                const response = await fetch(
                    `/action/accept-attack/${roomId}`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message);
                }

                currentPendingAttackId = null;
                hideIncomingAttack();

                await updateGameStatus();

            } catch (error) {
                if (incomingMessage) {
                    incomingMessage.textContent = error.message;
                }
            } finally {
                isAcceptingAttack = false;
                acceptButton.disabled = false;
                acceptButton.textContent = 'Accept Attack (-10 HP)';
            }
        });
    }

    // Defense button opens the existing scan page.
    if (defendButton) {
        defendButton.addEventListener('click', function () {
            // No additional action is needed here.
        });
    }

    // Initial update
    updateGameStatus();

    // Refresh game status every second
    setInterval(updateGameStatus, 1000);
});
