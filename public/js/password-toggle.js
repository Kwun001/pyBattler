document.querySelectorAll('.password-field').forEach(function (wrapper) {
    const input = wrapper.querySelector('input');
    const btn = wrapper.querySelector('.password-toggle-btn');

    if (!input || !btn) return;

    btn.addEventListener('click', function () {
        const isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';
        btn.textContent = isHidden ? 'Hide' : 'Show';
        btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    });
});