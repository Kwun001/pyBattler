const questionText = document.getElementById('questionText');
const questionId = document.getElementById('questionId');
const questionImage = document.getElementById('questionImage');
const answerForm = document.getElementById('answerForm');
const answerOptions = document.getElementById('answerOptions');
const answerMessage = document.getElementById('answerMessage');

const targetSection = document.getElementById('targetSection');
const targetPlayer = document.getElementById('targetPlayer');
const resultPopup = document.getElementById('resultPopup');
const resultPopupTitle = document.getElementById('resultPopupTitle');
const resultPopupMessage = document.getElementById('resultPopupMessage');

let isSubmitting = false;

function showResultPopup(title, message) {
    resultPopupTitle.textContent = title;
    resultPopupMessage.textContent = message;
    resultPopup.classList.add('show');
    resultPopup.setAttribute('aria-hidden', 'false');
}

async function loadQuestion() {
    try {
        const response = await fetch('/question/random');
        const question = await response.json();

        if (!response.ok) {
            throw new Error(question.message);
        }

        questionText.textContent = question.question_text;
        questionId.value = question.question_id;
        answerOptions.innerHTML = '';

        // Display question image if available
        if (question.image_url) {
            questionImage.src = question.image_url;
            questionImage.hidden = false;
        } else {
            questionImage.src = '';
            questionImage.hidden = true;
        }

        question.options.forEach(option => {
            const label = document.createElement('label');
            label.className = 'answer-option';

            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'choice';
            radio.value = option.text;
            radio.required = true;

            const letter = document.createElement('span');
            letter.className = 'option-letter';
            letter.textContent = option.letter;

            const text = document.createElement('span');
            text.textContent = option.text;

            label.appendChild(radio);
            label.appendChild(letter);
            label.appendChild(text);
            answerOptions.appendChild(label);
        });

        if (question.card_type === 'Attack' ||
            question.card_type === 'Revive') {

            targetSection.style.display = 'block';
            targetPlayer.innerHTML =
                '<option value="">Select a player</option>';

            question.targets.forEach(player => {
                const option = document.createElement('option');
                option.value = player.participant_id;
                option.textContent = player.player_name;
                targetPlayer.appendChild(option);
            });
        } else {
            targetSection.style.display = 'none';
        }

        answerMessage.textContent =
            question.card_type === 'Defense'
                ? 'Answer correctly to block the incoming attack.'
                : 'Choose one answer. You only have one attempt.';

    } catch (error) {
        questionText.textContent = 'Unable to load question.';
        answerMessage.textContent = error.message;
    }
}

answerForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    if (isSubmitting) return;

    const selectedAnswer =
        document.querySelector('input[name="choice"]:checked');

    if (!selectedAnswer) {
        answerMessage.textContent = 'Please select an answer.';
        return;
    }

    if (targetSection.style.display !== 'none' && !targetPlayer.value) {
        answerMessage.textContent = 'Please select a target.';
        return;
    }

    isSubmitting = true;

    const submitButton =
        answerForm.querySelector('button[type="submit"]');

    submitButton.disabled = true;
    answerMessage.textContent = 'Processing your action...';

    try {
        const response = await fetch('/action/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                answer: selectedAnswer.value,
                target_id: targetPlayer.value || null
            })
        });

        const result = await response.json();

        if (!response.ok) {
            showResultPopup('Action Not Allowed', result.message);

            setTimeout(() => {
                window.location.href = `/game/${getRoomId()}`;
            }, 2500);

            return;
        }

        answerMessage.textContent = result.message;

        const popupTitle = result.pending
            ? 'Attack Initiated'
            : result.success
                ? 'Action Successful'
                : 'Action Unsuccessful';

        showResultPopup(popupTitle, result.message);

        setTimeout(() => {
            window.location.href = result.game_url;
        }, 1800);

    } catch (error) {
        showResultPopup('Error', error.message);
        isSubmitting = false;
        submitButton.disabled = false;
    }
});

function getRoomId() {
    return document.querySelector('.question-page').dataset.roomId;
}

loadQuestion();
