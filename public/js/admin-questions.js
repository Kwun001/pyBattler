const questionForm = document.getElementById('questionForm');
const questionFormTitle = document.getElementById('questionFormTitle');
const questionResultPopup = document.getElementById('questionResultPopup');
const questionResultTitle = document.getElementById('questionResultTitle');
const questionResultMessage = document.getElementById('questionResultMessage');
const closeQuestionResultBtn = document.getElementById('closeQuestionResultBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

const questionIdInput = document.getElementById('questionIdInput');
const questionTextInput = document.getElementById('questionText');
const optionInputs = {
    A: document.getElementById('optionA'),
    B: document.getElementById('optionB'),
    C: document.getElementById('optionC'),
    D: document.getElementById('optionD')
};

const correctAnswerInput = document.getElementById('correctAnswer');
const correctAnswerToggle = document.getElementById('correctAnswerToggle');
const correctAnswerLabel = document.getElementById('correctAnswerLabel');
const correctAnswerList = document.getElementById('correctAnswerList');
const correctAnswerWrapper = document.getElementById('correctAnswerWrapper');


const questionImageInput = document.getElementById('questionImage');
const imagePreview = document.getElementById('imagePreview');
const removeImageCheckbox = document.getElementById('removeImage');
const removeImageLabel = document.getElementById('removeImageLabel');

const questionsTableBody = document.getElementById('questionsTableBody');
const questionCount = document.getElementById('questionCount');

const deleteConfirmPopup = document.getElementById('deleteConfirmPopup');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

let editingImageUrl = null;
let pendingDeleteId = null;

function showFormMessage(text, isError) {
    questionResultTitle.textContent = isError ? 'Something went wrong' : 'Success!';
    questionResultMessage.textContent = text;
    questionResultPopup.style.display = 'flex';
}

closeQuestionResultBtn.addEventListener('click', function () {
    questionResultPopup.style.display = 'none';
});

questionResultPopup.addEventListener('click', function (event) {
    if (event.target === questionResultPopup) questionResultPopup.style.display = 'none';
});

// Keep the "Correct answer" dropdown in sync with whatever the four
// option fields currently say, so the admin always picks real text.
function selectCorrectAnswer(value, label) {
    correctAnswerInput.value = value;
    correctAnswerLabel.textContent = label || 'Select the correct option above';
    closeCorrectAnswerDropdown();
}

function closeCorrectAnswerDropdown() {
    correctAnswerWrapper.classList.remove('open');
    correctAnswerList.hidden = true;
}

function refreshCorrectAnswerOptions() {
    const previousValue = correctAnswerInput.value;
    correctAnswerList.innerHTML = '';

    let stillValid = false;

    Object.keys(optionInputs).forEach(function (letter) {
        const text = optionInputs[letter].value.trim();

        if (!text) return;

        const item = document.createElement('li');
        item.className = 'custom-select-item';
        item.setAttribute('role', 'option');
        item.textContent = letter + ': ' + text;

        if (text === previousValue) {
            item.classList.add('selected');
            stillValid = true;
        }

        item.addEventListener('click', function () {
            selectCorrectAnswer(text, letter + ': ' + text);
        });

        correctAnswerList.appendChild(item);
    });

    if (correctAnswerList.children.length === 0) {
        correctAnswerList.innerHTML = '<li class="custom-select-empty">Fill in the options above first</li>';
    }

    if (!stillValid) {
        correctAnswerInput.value = '';
        correctAnswerLabel.textContent = 'Select the correct option above';
    }
}

correctAnswerToggle.addEventListener('click', function (event) {
    event.stopPropagation();
    const isOpen = correctAnswerWrapper.classList.toggle('open');
    correctAnswerList.hidden = !isOpen;
});

document.addEventListener('click', function (event) {
    if (!correctAnswerWrapper.contains(event.target)) closeCorrectAnswerDropdown();
});


Object.values(optionInputs).forEach(function (input) {
    input.addEventListener('input', refreshCorrectAnswerOptions);
});

questionImageInput.addEventListener('change', function () {
    if (questionImageInput.files && questionImageInput.files[0]) {
        imagePreview.src = URL.createObjectURL(questionImageInput.files[0]);
        imagePreview.hidden = false;
        removeImageCheckbox.checked = false;
    }
});

function resetForm() {
    questionForm.reset();
    questionIdInput.value = '';
    selectCorrectAnswer('', 'Select the correct option above');
    questionFormTitle.textContent = 'Add a new question';
    cancelEditBtn.hidden = true;
    imagePreview.hidden = true;
    imagePreview.src = '';
    removeImageCheckbox.hidden = true;
    removeImageLabel.hidden = true;
    removeImageCheckbox.checked = false;
    editingImageUrl = null;

}

cancelEditBtn.addEventListener('click', resetForm);

function renderQuestionsTable(questions) {
    questionCount.textContent = questions.length + (questions.length === 1 ? ' question' : ' questions');

    if (questions.length === 0) {
        questionsTableBody.innerHTML = '<tr><td colspan="4" class="empty-history">No questions yet.</td></tr>';
        return;
    }

    questionsTableBody.innerHTML = '';

    questions.forEach(function (q) {
        const row = document.createElement('tr');

        const textCell = document.createElement('td');
        textCell.textContent = q.question_text.length > 80
            ? q.question_text.slice(0, 80) + '…'
            : q.question_text;

        const answerCell = document.createElement('td');
        answerCell.textContent = q.correct_answer;

        const imageCell = document.createElement('td');
        if (q.image_url) {
            const img = document.createElement('img');
            img.src = q.image_url;
            img.alt = 'Question image';
            img.className = 'admin-question-thumb';
            imageCell.appendChild(img);
        } else {
            const span = document.createElement('span');
            span.className = 'admin-no-image';
            span.textContent = 'None';
            imageCell.appendChild(span);
        }

        const statusCell = document.createElement('td');
        const statusSpan = document.createElement('span');
        statusSpan.className = 'history-status ' + (q.is_active ? 'status-alive' : 'status-inactive');
        statusSpan.textContent = q.is_active ? 'Active' : 'Removed';
        statusCell.appendChild(statusSpan);

        const actionCell = document.createElement('td');

        const actionContainer = document.createElement('div');
        actionContainer.className = 'admin-row-actions';

        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'btn btn-light btn-view';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', function () { startEdit(q); });

        actionContainer.appendChild(editBtn);

        if (q.is_active) {
            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'btn btn-delete btn-view';
            deleteBtn.textContent = 'Remove';
            deleteBtn.addEventListener('click', function () { askDeleteConfirmation(q.question_id); });
            actionContainer.appendChild(deleteBtn);
        } else {
            const restoreBtn = document.createElement('button');
            restoreBtn.type = 'button';
            restoreBtn.className = 'btn btn-light btn-view';
            restoreBtn.textContent = 'Restore';
            restoreBtn.addEventListener('click', function () { restoreQuestion(q.question_id); });
            actionContainer.appendChild(restoreBtn);
        }

        actionCell.appendChild(actionContainer);

        row.appendChild(textCell);
        row.appendChild(answerCell);
        row.appendChild(imageCell);
        row.appendChild(statusCell);
        row.appendChild(actionCell);

        questionsTableBody.appendChild(row);
    });
}

async function loadQuestions() {
    try {
        const response = await fetch('/admin/api/questions');
        const data = await response.json();

        if (!response.ok) throw new Error(data.message);

        renderQuestionsTable(data.questions);

    } catch (error) {
        questionsTableBody.innerHTML = '<tr><td colspan="4" class="empty-history">Unable to load questions.</td></tr>';
        console.error(error);
    }
}

function startEdit(q) {
    questionIdInput.value = q.question_id;
    questionTextInput.value = q.question_text;
    optionInputs.A.value = q.option_a;
    optionInputs.B.value = q.option_b;
    optionInputs.C.value = q.option_c;
    optionInputs.D.value = q.option_d;

    refreshCorrectAnswerOptions();
    selectCorrectAnswer(q.correct_answer, q.correct_answer);

    editingImageUrl = q.image_url;

    if (q.image_url) {
        imagePreview.src = q.image_url;
        imagePreview.hidden = false;
        removeImageCheckbox.hidden = false;
        removeImageLabel.hidden = false;
    } else {
        imagePreview.hidden = true;
        removeImageCheckbox.hidden = true;
        removeImageLabel.hidden = true;
    }

    removeImageCheckbox.checked = false;
    questionImageInput.value = '';

    questionFormTitle.textContent = 'Edit question ' + q.question_id;
    cancelEditBtn.hidden = false;

    questionForm.scrollIntoView({ behavior: 'smooth' });
}

function askDeleteConfirmation(questionId) {
    pendingDeleteId = questionId;
    deleteConfirmPopup.style.display = 'flex';
}

function closeDeleteConfirmation() {
    pendingDeleteId = null;
    deleteConfirmPopup.style.display = 'none';
}

async function restoreQuestion(questionId) {
    try {
        const response = await fetch('/admin/api/questions/' + questionId + '/restore', {
            method: 'POST'
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data.message);

        loadQuestions();

    } catch (error) {
        showFormMessage(error.message || 'Unable to restore question.', true);
    }
}

cancelDeleteBtn.addEventListener('click', closeDeleteConfirmation);

deleteConfirmPopup.addEventListener('click', function (event) {
    if (event.target === deleteConfirmPopup) closeDeleteConfirmation();
});

confirmDeleteBtn.addEventListener('click', async function () {
    if (!pendingDeleteId) return;

    const questionId = pendingDeleteId;
    confirmDeleteBtn.disabled = true;

    try {
        const response = await fetch('/admin/api/questions/' + questionId, {
            method: 'DELETE'
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data.message);

        if (questionIdInput.value === questionId) resetForm();

        closeDeleteConfirmation();
        await loadQuestions();
        showFormMessage('Question is removed successfully!', false);

    } catch (error) {
        closeDeleteConfirmation();
        showFormMessage(error.message || 'Unable to delete question.', true);
    } finally {
        confirmDeleteBtn.disabled = false;
    }
});

questionForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    if (!correctAnswerInput.value) {
        showFormMessage('Please select the correct answer.', true);
        return;
    }

    const formData = new FormData(questionForm);
    const questionId = questionIdInput.value;
    const isEdit = Boolean(questionId);

    if (!isEdit) {
        formData.delete('question_id');
    }

    try {
        const response = await fetch(
            isEdit ? '/admin/api/questions/' + questionId : '/admin/api/questions',
            {
                method: isEdit ? 'PUT' : 'POST',
                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok) throw new Error(data.message);

        showFormMessage(isEdit ? 'Question updated.' : 'Question is created successfully!', false);
        resetForm();
        loadQuestions();

    } catch (error) {
        showFormMessage(error.message || 'Unable to save question.', true);
    }
});

refreshCorrectAnswerOptions();
loadQuestions();
