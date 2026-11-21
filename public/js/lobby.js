document.addEventListener('DOMContentLoaded', function () {
    const copyButton = document.getElementById('copyCode');
    const playerList = document.getElementById('playerList');
    const playerCount = document.getElementById('playerCount');
    const joinedCount = document.getElementById('joinedCount');
    const roomStatus = document.getElementById('roomStatus');
    const startButton = document.getElementById('startButton');
    const lobbyMessage = document.getElementById('lobbyMessage');
    const startForm = document.getElementById('startForm');
    const waitingMessage = document.getElementById('waitingMessage');
    const currentParticipantId = playerList.dataset.participantId;

    const roomId = playerList.dataset.roomId;
        

    // Guest profile registration popup
    const profileLink = document.getElementById('profileLink');
    const guestProfilePopup = document.getElementById('guestProfilePopup');
    const registerGuest = document.getElementById('registerGuest');
    const closeGuestPopup = document.getElementById('closeGuestPopup');

    console.log('Profile link:', profileLink);
    console.log('Guest status:', profileLink?.dataset.guest);
    console.log('Guest popup:', guestProfilePopup);

    if (profileLink && profileLink.dataset.guest === 'true' && guestProfilePopup) {
        profileLink.addEventListener('click', function (event) {
            event.preventDefault();
            guestProfilePopup.style.display = 'flex';
        });
    }

    if (registerGuest) {
        registerGuest.addEventListener('click', function () {
            window.location.href = '/signup';
        });
    }

    if (closeGuestPopup && guestProfilePopup) {
        closeGuestPopup.addEventListener('click', function () {
            guestProfilePopup.style.display = 'none';
        });
    }

    // Copy actual room code
    if (copyButton) {
        copyButton.addEventListener('click', function () {
            const roomCode = copyButton.dataset.roomCode;

            if (navigator.clipboard) {
                navigator.clipboard.writeText(roomCode)
                    .then(function () {
                        copyButton.textContent = 'Copied!';
                    })
                    .catch(function () {
                        alert('Room code: ' + roomCode);
                    });
            } else {
                alert('Room code: ' + roomCode);
            }
        });
    }

    // Update player list
    function updatePlayers(participants, hostParticipantId, maxPlayers) {
        playerList.innerHTML = '';

        participants.forEach(function (participant) {
            const playerRow = document.createElement('div');
            playerRow.className = 'player-row';

            const avatar = document.createElement('span');
            avatar.className = 'player-avatar avatar-purple';
            avatar.textContent = participant.player_name.charAt(0).toUpperCase();

            const details = document.createElement('div');
            details.className = 'player-details';

            const name = document.createElement('strong');
            name.textContent = participant.player_name;

            details.appendChild(name);

            if (participant.participant_id === hostParticipantId) {
                const hostLabel = document.createElement('span');
                hostLabel.className = 'host-label';
                hostLabel.textContent = 'HOST';
                details.appendChild(hostLabel);
            } else {
                const playerLabel = document.createElement('span');
                playerLabel.textContent = 'Player';
                details.appendChild(playerLabel);
            }

            const readyLabel = document.createElement('span');
            readyLabel.className = 'ready-label ready';
            readyLabel.textContent = 'Joined';

            playerRow.appendChild(avatar);
            playerRow.appendChild(details);
            playerRow.appendChild(readyLabel);

            playerList.appendChild(playerRow);
        });

        playerCount.textContent = participants.length + '/' + maxPlayers;
        joinedCount.textContent = '● ' + participants.length + ' joined';

        if (startButton) {
            startButton.disabled = participants.length < 2;
        }
    }

    // Check room status and players every 2 seconds
    async function checkRoomStatus() {
        try {
            const response = await fetch('/lobby/' + roomId + '/status');

            if (!response.ok) {
                return;
            }

            const data = await response.json();

            // Automatically enter the game when the host starts it
            if (data.status === 'In Progress') {
                window.location.href = '/game/' + roomId;
                return;
            }

            roomStatus.textContent = '● ' + data.status;

            updatePlayers(
                data.participants,
                data.hostParticipantId,
                data.maxPlayers
            );

            const isHost = String(data.hostParticipantId) === String(currentParticipantId) && currentParticipantId !== '';

            if (startForm) startForm.hidden = !isHost;
            if (waitingMessage) waitingMessage.hidden = isHost;

            if (startButton) {
                startButton.disabled = data.participants.length < 2 || data.status !== 'Waiting';
            }

            if (lobbyMessage) {
                lobbyMessage.textContent =
                    'Waiting for players to join. At least 2 players are required to start.';
            }

        } catch (error) {
            console.error('Unable to update lobby:', error);
        }
    }

    checkRoomStatus();
    setInterval(checkRoomStatus, 2000);
});