const express = require('express');
const db = require('../config/db');

const router = express.Router();

// Fisher-Yates shuffle
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Display Question Page
router.get('/', (req, res) => {
    if (!req.session.selectedCard) {
        return res.redirect('/rooms');
    }

    res.render('question', {
        title: 'Question',
        room_id: req.session.selectedCard.room_id
    });
});

// Get a random question
router.get('/random', async (req, res) => {
    try {
        if (!req.session.selectedCard) {
            return res.status(400).json({
                message: 'Please scan a card first.'
            });
        }

        const selectedCard = req.session.selectedCard;

        const [questions] = await db.query(
            `SELECT question_id, question_text,
                    option_a, option_b, option_c, option_d,
                    correct_answer, image_url
             FROM Question
             WHERE is_active = 1
             ORDER BY RAND()
             LIMIT 1`
        );

        if (questions.length === 0) {
            return res.status(404).json({
                message: 'No questions available.'
            });
        }

        const question = questions[0];

        // correct_answer now holds the literal correct text, not a letter,
        // so it stays correct regardless of how the options get shuffled below
        req.session.currentQuestion = {
            question_id: question.question_id,
            correct_answer: question.correct_answer
        };

        let targets = [];

        if (selectedCard.card_type === 'Attack') {
            const [players] = await db.query(
                `SELECT participant_id, player_name
                 FROM Participant
                 WHERE room_id = ?
                 AND participant_id != ?
                 AND is_alive = TRUE`,
                [
                    selectedCard.room_id,
                    selectedCard.participant_id
                ]
            );

            targets = players;

        } else if (selectedCard.card_type === 'Revive') {
            const [players] = await db.query(
                `SELECT participant_id, player_name
                 FROM Participant
                 WHERE room_id = ?
                 AND hp = 0`,
                [selectedCard.room_id]
            );

            targets = players;
        }

        // Shuffle the four option texts into a random order, then label them
        // A/B/C/D purely for display — the label is not what gets checked.
        const shuffledOptions = shuffle([
            question.option_a,
            question.option_b,
            question.option_c,
            question.option_d
        ]);

        res.json({
            question_id: question.question_id,
            question_text: question.question_text,
            image_url: question.image_url,
            card_type: selectedCard.card_type,
            options: shuffledOptions.map(function (text, i) {
                return { letter: 'ABCD'[i], text };
            }),
            targets
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Unable to retrieve question.'
        });
    }
});

module.exports = router;
