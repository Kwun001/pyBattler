
document.addEventListener('DOMContentLoaded', function () {

    // Room code input validation
    const form = document.getElementById('joinRoomForm');
    const roomCode = document.getElementById('roomCode');

    if (form && roomCode) {
        roomCode.addEventListener('input', function () {
            roomCode.value = roomCode.value
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '');
        });
    }

    // Room error popup
    const overlay = document.getElementById('roomErrorOverlay');
    const okButton = document.getElementById('roomErrorOk');

    if (overlay && okButton) {
        okButton.focus();

        okButton.addEventListener('click', function () {
            overlay.remove();

            if (roomCode) {
                roomCode.focus();
            }

            window.history.replaceState({}, document.title, '/rooms');
        });
    }

});
