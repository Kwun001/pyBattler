document.addEventListener('DOMContentLoaded', function () {

    // Registration success popup
    const successPopup = document.getElementById('registrationSuccessPopup');
    const closeSuccessButton = document.getElementById('closeRegistrationPopup');

    // Check whether the account was created successfully
    const urlParams = new URLSearchParams(window.location.search);
    const registered = urlParams.get('registered');

    if (successPopup && closeSuccessButton) {
        closeSuccessButton.addEventListener('click', function () {
            successPopup.style.display = 'none';
        });

        successPopup.addEventListener('click', function (event) {
            if (event.target === successPopup) {
                successPopup.style.display = 'none';
            }
        });

        if (registered === '1') {
            successPopup.style.display = 'flex';
        }
    }

    // Login form
    const form = document.getElementById('loginForm');

    if (!form) {
        return;
    }

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    const emailFeedback = document.getElementById('emailFeedback');
    const passwordFeedback = document.getElementById('passwordFeedback');

    const popup = document.getElementById('loginValidationPopup');
    const popupMessage = document.getElementById('loginValidationMessage');
    const closeButton = document.getElementById('closeLoginPopup');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Display validation feedback
    function showFeedback(input, feedback, message, isValid) {
        feedback.textContent = message;

        input.classList.remove('valid', 'invalid');
        feedback.classList.remove('valid-message', 'invalid-message');

        if (isValid) {
            input.classList.add('valid');
            feedback.classList.add('valid-message');
        } else {
            input.classList.add('invalid');
            feedback.classList.add('invalid-message');
        }
    }

    // Show login validation popup
    function showPopup(message) {
        popupMessage.textContent = message;
        popup.style.display = 'flex';
    }

    // Close login validation popup
    function closePopup() {
        popup.style.display = 'none';
    }

    if (popup && closeButton) {
        closeButton.addEventListener('click', closePopup);

        popup.addEventListener('click', function (event) {
            if (event.target === popup) {
                closePopup();
            }
        });

        // Display server-side login error
        if (popup.dataset.show === 'true') {
            popup.style.display = 'flex';
        }
    }

    // Validate email format
    function validateEmail() {
        const email = emailInput.value.trim();

        if (email === '') {
            emailInput.classList.remove('valid', 'invalid');
            emailFeedback.textContent = '';
            emailFeedback.classList.remove('valid-message', 'invalid-message');
            return false;
        }

        if (emailRegex.test(email)) {
            showFeedback(
                emailInput,
                emailFeedback,
                'Valid email format.',
                true
            );

            return true;
        }

        showFeedback(
            emailInput,
            emailFeedback,
            'Please enter a valid email address.',
            false
        );

        return false;
    }

    // Check whether password has been entered
    function validatePassword() {
        const password = passwordInput.value;

        if (password === '') {
            passwordInput.classList.remove('valid', 'invalid');
            passwordFeedback.textContent = '';
            passwordFeedback.classList.remove('valid-message', 'invalid-message');
            return false;
        }

        showFeedback(
            passwordInput,
            passwordFeedback,
            'Password entered.',
            true
        );

        return true;
    }

    // Live email validation
    emailInput.addEventListener('input', validateEmail);

    // Live password feedback
    passwordInput.addEventListener('input', validatePassword);

    // Validate before submitting
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (email === '' && password === '') {
            showPopup('Please enter your email and password.');
            return;
        }

        if (email === '') {
            showPopup('Please enter your email address.');
            return;
        }

        if (password === '') {
            showPopup('Please enter your password.');
            return;
        }

        if (!validateEmail()) {
            showPopup('Please enter a valid email address.');
            return;
        }

        form.submit();
    });
});
