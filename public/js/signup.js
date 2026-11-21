
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('signupForm');

    if (!form) {
        return;
    }

    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    const emailFeedback = document.getElementById('emailFeedback');
    const passwordFeedback = document.getElementById('passwordFeedback');

    const popup = document.getElementById('signupValidationPopup');
    const popupMessage = document.getElementById('signupValidationMessage');
    const closeButton = document.getElementById('closeSignupPopup');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/;

    let emailCheckNumber = 0;

    // Show popup message
    function showPopup(message) {
        popupMessage.textContent = message;
        popup.style.display = 'flex';
    }

    // Close popup
    function closePopup() {
        popup.style.display = 'none';
    }

    closeButton.addEventListener('click', closePopup);

    popup.addEventListener('click', function (event) {
        if (event.target === popup) {
            closePopup();
        }
    });

    // Display server-side signup error when the page loads
    if (popup.dataset.show === 'true') {
        popup.style.display = 'flex';
    }

    // Update validation feedback
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

    // Validate email format and availability
    async function validateEmail() {
        const email = emailInput.value.trim();

        if (email === '') {
            emailInput.classList.remove('valid', 'invalid');
            emailFeedback.textContent = '';
            emailFeedback.classList.remove('valid-message', 'invalid-message');
            return false;
        }

        if (!emailRegex.test(email)) {
            showFeedback(
                emailInput,
                emailFeedback,
                'Please enter a valid email address.',
                false
            );
            return false;
        }

        const currentCheck = ++emailCheckNumber;

        emailFeedback.textContent = 'Checking email...';
        emailFeedback.classList.remove('valid-message', 'invalid-message');
        emailInput.classList.remove('valid', 'invalid');

        try {
            const response = await fetch(
                `/api/users/check-email?email=${encodeURIComponent(email)}`
            );

            const result = await response.json();

            if (currentCheck !== emailCheckNumber) {
                return false;
            }

            if (emailInput.value.trim() !== email) {
                return false;
            }

            if (result.available) {
                showFeedback(
                    emailInput,
                    emailFeedback,
                    'Email is available.',
                    true
                );

                return true;
            }

            showFeedback(
                emailInput,
                emailFeedback,
                'This email is already registered.',
                false
            );

            return false;

        } catch (error) {
            if (currentCheck === emailCheckNumber) {
                showFeedback(
                    emailInput,
                    emailFeedback,
                    'Unable to check email. Please try again.',
                    false
                );
            }

            return false;
        }
    }

    // Validate password strength
    function validatePassword() {
        const password = passwordInput.value;

        if (password === '') {
            passwordInput.classList.remove('valid', 'invalid');
            passwordFeedback.textContent = '';
            passwordFeedback.classList.remove('valid-message', 'invalid-message');
            return false;
        }

        if (passwordRegex.test(password)) {
            showFeedback(
                passwordInput,
                passwordFeedback,
                'Password meets all requirements.',
                true
            );

            return true;
        }

        showFeedback(
            passwordInput,
            passwordFeedback,
            'Password does not meet all requirements.',
            false
        );

        return false;
    }

    // Check email when the user types
    emailInput.addEventListener('input', function () {
        validateEmail();
    });

    // Check password when the user types
    passwordInput.addEventListener('input', function () {
        validatePassword();
    });

    // Validate before submitting the form
    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (username === '') {
            showPopup('Please enter your username.');
            return;
        }

        if (username.length < 3) {
            showPopup('Username must contain at least 3 characters.');
            return;
        }

        if (email === '') {
            showPopup('Please enter your email address.');
            return;
        }

        if (!emailRegex.test(email)) {
            showPopup('Please enter a valid email address.');
            return;
        }

        if (password === '') {
            showPopup('Please enter your password.');
            return;
        }

        const emailAvailable = await validateEmail();

        if (!emailAvailable) {
            if (emailRegex.test(email)) {
                showPopup(
                    emailFeedback.textContent === 'This email is already registered.'
                        ? 'This email is already registered. Please use another email.'
                        : 'Unable to verify your email. Please try again.'
                );
            } else {
                showPopup('Please enter a valid email address.');
            }

            return;
        }

        if (!validatePassword()) {
            showPopup(
                'Password must contain at least 8 characters, including uppercase, lowercase, a number and a symbol.'
            );
            return;
        }

        form.submit();
    });
});
