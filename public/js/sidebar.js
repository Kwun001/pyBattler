document.addEventListener('DOMContentLoaded', function () {
    const popup = document.getElementById('guestProfilePopup');
    const profileLink = document.getElementById('guestProfileLink');
    const playLink = document.getElementById('playLink');
    const closeButton = document.getElementById('closeGuestPopup');

    if (profileLink && popup) {
        profileLink.addEventListener('click', function (event) {
            event.preventDefault();

            popup.style.display = 'flex';

            profileLink.classList.add('active');

            if (playLink) {
                playLink.classList.remove('active');
            }
        });
    }
    
    function closePopup() {
        popup.style.display = 'none';

        profileLink.classList.remove('active');

        if (playLink) {
            playLink.classList.add('active');
        }
    }

    if (closeButton && popup) {
        closeButton.addEventListener('click', closePopup);
    }

    if (popup) {
        popup.addEventListener('click', function (event) {
            if (event.target === popup) {
                closePopup();
        }
        });
    }
});
