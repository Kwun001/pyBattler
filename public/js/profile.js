document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('profileForm');

    if (!form) {
        return;
    }

    // Automatically hide profile messages after 5 seconds
    const profileMessage = document.querySelector('.profile-message');

    if (profileMessage) {
        setTimeout(function () {
            profileMessage.style.display = 'none';
        }, 3000);
    }
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    const emailFeedback = document.getElementById('emailFeedback');
    const passwordFeedback = document.getElementById('passwordFeedback');
    const confirmPasswordFeedback = document.getElementById('confirmPasswordFeedback');

    const popup = document.getElementById('profileValidationPopup');
    const popupMessage = document.getElementById('profileValidationMessage');
    const closePopupButton = document.getElementById('closeProfileValidation');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/;

    let emailAvailable = false;
    let emailCheckNumber = 0;

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

    // Show custom popup
    function showPopup(message) {
        popupMessage.textContent = message;
        popup.style.display = 'flex';
    }

    // Close custom popup
    function closePopup() {
        popup.style.display = 'none';
    }

    if (closePopupButton) {
        closePopupButton.addEventListener('click', closePopup);
    }

    if (popup) {
        popup.addEventListener('click', function (event) {
            if (event.target === popup) {
                closePopup();
            }
        });
    }

    // Validate email format and availability
    async function validateEmail() {
        const email = emailInput.value.trim();

        emailAvailable = false;

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

        emailInput.classList.remove('valid', 'invalid');
        emailFeedback.textContent = 'Checking email...';
        emailFeedback.classList.remove('valid-message', 'invalid-message');

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
                emailAvailable = true;

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
            emailAvailable = false;

            showFeedback(
                emailInput,
                emailFeedback,
                'Unable to check email. Please try again.',
                false
            );

            return false;
        }
    }

    // Validate new password
    function validatePassword() {
        const password = newPasswordInput.value;

        if (password === '') {
            newPasswordInput.classList.remove('valid', 'invalid');
            passwordFeedback.textContent = '';
            passwordFeedback.classList.remove('valid-message', 'invalid-message');
            return true;
        }

        if (passwordRegex.test(password)) {
            showFeedback(
                newPasswordInput,
                passwordFeedback,
                'Password meets all requirements.',
                true
            );

            return true;
        }

        showFeedback(
            newPasswordInput,
            passwordFeedback,
            'Password does not meet all requirements.',
            false
        );

        return false;
    }

    // Validate password confirmation
    function validateConfirmPassword() {
        const password = newPasswordInput.value;
        const confirmation = confirmPasswordInput.value;

        if (password === '' && confirmation === '') {
            confirmPasswordInput.classList.remove('valid', 'invalid');
            confirmPasswordFeedback.textContent = '';
            confirmPasswordFeedback.classList.remove('valid-message', 'invalid-message');
            return true;
        }

        if (confirmation === '') {
            return true;
        }

        if (password === confirmation) {
            showFeedback(
                confirmPasswordInput,
                confirmPasswordFeedback,
                'Passwords match.',
                true
            );

            return true;
        }

        showFeedback(
            confirmPasswordInput,
            confirmPasswordFeedback,
            'Passwords do not match.',
            false
        );

        return false;
    }

    // Live email validation
    emailInput.addEventListener('input', function () {
        validateEmail();
    });

    // Live password validation
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function () {
            validatePassword();
            validateConfirmPassword();
        });
    }

    // Live confirmation validation
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function () {
            validateConfirmPassword();
        });
    }
    // Validate before submitting
    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const currentPassword = currentPasswordInput ? currentPasswordInput.value : '';
        const newPassword = newPasswordInput ? newPasswordInput.value : '';
        const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';

        // Current password is required for every profile update
        if (!currentPassword) {
            showPopup('Please enter your current password.');
            return;
        }

        // Only validate confirmation when changing password
        if (newPassword && !confirmPassword) {
            showPopup('Please confirm your new password.');
            return;
        }

        if (!newPassword && confirmPassword) {
            showPopup('Please enter a new password.');
            return;
        }

        // Check required profile information
        if (!usernameInput.value.trim()) {
            showPopup('Please enter your username.');
            return;
        }

        if (!emailInput.value.trim()) {
            showPopup('Please enter your email address.');
            return;
        }

        const emailValid = await validateEmail();
        const passwordValid = newPasswordInput ? validatePassword() : true;
        const confirmationValid = confirmPasswordInput ? validateConfirmPassword() : true;

        if (!emailValid || !passwordValid || !confirmationValid) {
            showPopup('Please check your email and password fields before saving.');
            return;
        }

        form.submit();
    });
});
