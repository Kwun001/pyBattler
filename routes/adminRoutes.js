const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const db = require('../config/db');

const router = express.Router();

// ---------------------------------------------------------------------------
// Image upload (question images)
// ---------------------------------------------------------------------------
const uploadDir = path.join(__dirname, '..', 'public', 'images', 'questions');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const unique = crypto.randomBytes(8).toString('hex');
        cb(null, unique + path.extname(file.originalname).toLowerCase());
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: function (req, file, cb) {
        const allowed = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
        if (!allowed.includes(path.extname(file.originalname).toLowerCase())) {
            return cb(new Error('Only image files are allowed.'));
        }
        cb(null, true);
    }
});

// Remove an uploaded image file from disk (ignore if it's already gone)
function removeImageFile(imageUrl) {
    if (!imageUrl) return;
    const filePath = path.join(__dirname, '..', 'public', imageUrl);
    fs.unlink(filePath, function () { /* ignore errors */ });
}

function generateQuestionId(lastId) {
    const next = lastId ? parseInt(lastId.substring(1)) + 1 : 1;
    return 'Q' + String(next).padStart(4, '0');
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
router.get('/', async (req, res) => {
    try {
        const [[userCount]] = await db.query(
            `SELECT COUNT(*) AS total FROM User`
        );
        const [[questionCount]] = await db.query(
            `SELECT COUNT(*) AS total FROM Question`
        );
        const [[gameCount]] = await db.query(
            `SELECT COUNT(*) AS total FROM Room WHERE status = 'Completed'`
        );
        const [[activeGameCount]] = await db.query(
            `SELECT COUNT(*) AS total FROM Room WHERE status != 'Completed'`
        );

        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            activePage: 'admin',
            stats: {
                users: userCount.total,
                questions: questionCount.total,
                completedGames: gameCount.total,
                activeGames: activeGameCount.total
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Unable to load admin dashboard.');
    }
});

// ---------------------------------------------------------------------------
// Game history
// ---------------------------------------------------------------------------

// List all completed games
router.get('/games', async (req, res) => {
    try {
        const [games] = await db.query(
            `SELECT
                Room.room_id,
                Room.room_code,
                Room.status,
                Room.winner_id,
                Winner.player_name AS winner_name,
                (SELECT COUNT(*) FROM Participant
                 WHERE Participant.room_id = Room.room_id) AS player_count
             FROM Room
             LEFT JOIN Participant AS Winner
               ON Winner.participant_id = Room.winner_id
             WHERE Room.status = 'Completed'
             ORDER BY Room.room_id DESC`
        );

        res.render('admin/games', {
            title: 'Game History',
            activePage: 'dashboard',
            games
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Unable to load game history.');
    }
});

// One game's detail / leaderboard
router.get('/games/:room_id', async (req, res) => {
    const { room_id } = req.params;

    try {
        const [rooms] = await db.query(
            `SELECT * FROM Room WHERE room_id = ?`,
            [room_id]
        );

        if (rooms.length === 0) {
            return res.status(404).send('Game not found.');
        }

        const [participants] = await db.query(
            `SELECT
                Participant.participant_id,
                Participant.player_name,
                Participant.score,
                Participant.hp,
                Participant.is_alive,
                Leaderboard.rank
             FROM Participant
             LEFT JOIN Leaderboard
               ON Leaderboard.participant_id = Participant.participant_id
              AND Leaderboard.room_id = Participant.room_id
             WHERE Participant.room_id = ?
             ORDER BY Leaderboard.rank ASC, Participant.score DESC`,
            [room_id]
        );

        const room = rooms[0];

        const winner = participants.find(function (participant) {
            return participant.participant_id === room.winner_id;
        }) || null;

        res.render('admin/game-detail', {
            title: 'Game Detail',
            activePage: 'games',
            room,
            participants,
            winner,
            isDraw: room.status === 'Completed' && !winner
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Unable to load game detail.');
    }
});

// ---------------------------------------------------------------------------
// Player history
// ---------------------------------------------------------------------------

// Search / list players
router.get('/players', async (req, res) => {
    const search = (req.query.search || '').trim();

    try {
        const [players] = await db.query(
            `SELECT user_id, username, email, role
             FROM User
             WHERE role = 'Player'
             AND (username LIKE ? OR email LIKE ?)
             ORDER BY username ASC`,
            [`%${search}%`, `%${search}%`]
        );

        res.render('admin/players', {
            title: 'Players',
            activePage: 'admin',
            players,
            search
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Unable to load players.');
    }
});

// One player's game history
router.get('/players/:user_id/history', async (req, res) => {
    const { user_id } = req.params;

    try {
        const [users] = await db.query(
            `SELECT user_id, username, email FROM User WHERE user_id = ?`,
            [user_id]
        );

        if (users.length === 0) {
            return res.status(404).send('Player not found.');
        }

        const [history] = await db.query(
            `SELECT
                Room.room_id,
                Room.room_code,
                Room.status,
                Participant.score,
                Participant.hp,
                Participant.is_alive,
                Leaderboard.rank
             FROM Participant
             JOIN Room ON Room.room_id = Participant.room_id
             LEFT JOIN Leaderboard
               ON Leaderboard.participant_id = Participant.participant_id
              AND Leaderboard.room_id = Participant.room_id
             WHERE Participant.user_id = ?
             ORDER BY Room.room_id DESC`,
            [user_id]
        );

        res.render('admin/player-history', {
            title: 'Player History',
            activePage: 'admin',
            player: users[0],
            history
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Unable to load player history.');
    }
});

// ---------------------------------------------------------------------------
// Questions CRUD (page + REST JSON API)
// ---------------------------------------------------------------------------

router.get('/questions', async (req, res) => {
    res.render('admin/questions', {
        title: 'Manage Questions',
        activePage: 'admin'
    });
});

// List
router.get('/api/questions', async (req, res) => {
    try {
        const [questions] = await db.query(
            `SELECT question_id, question_text,
                    option_a, option_b, option_c, option_d,
                    correct_answer, image_url, is_active
             FROM Question
             ORDER BY question_id DESC`
        );

        res.json({ questions });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Unable to load questions.' });
    }
});

// Validate that correct_answer matches one of the four options exactly
function validateQuestionBody(body) {
    const { question_text, option_a, option_b, option_c, option_d, correct_answer } = body;

    if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_answer) {
        return 'All fields are required.';
    }

    const options = [option_a, option_b, option_c, option_d];

    if (!options.includes(correct_answer)) {
        return 'The correct answer must exactly match one of the four options.';
    }

    return null;
}

// Create
router.post('/api/questions', upload.single('image'), async (req, res) => {
    try {
        const validationError = validateQuestionBody(req.body);

        if (validationError) {
            if (req.file) removeImageFile('/images/questions/' + req.file.filename);
            return res.status(400).json({ message: validationError });
        }

        const { question_text, option_a, option_b, option_c, option_d, correct_answer } = req.body;

        const [lastRows] = await db.query(
            `SELECT question_id FROM Question ORDER BY question_id DESC LIMIT 1`
        );

        const questionId = generateQuestionId(lastRows[0] && lastRows[0].question_id);
        const imageUrl = req.file ? '/images/questions/' + req.file.filename : null;

        await db.query(
            `INSERT INTO Question
             (question_id, question_text, option_a, option_b, option_c, option_d,
              correct_answer, image_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [questionId, question_text, option_a, option_b, option_c, option_d, correct_answer, imageUrl]
        );

        res.status(201).json({ message: 'Question created.', question_id: questionId });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Unable to create question.' });
    }
});

// Update
router.put('/api/questions/:question_id', upload.single('image'), async (req, res) => {
    const { question_id } = req.params;

    try {
        const validationError = validateQuestionBody(req.body);

        if (validationError) {
            if (req.file) removeImageFile('/images/questions/' + req.file.filename);
            return res.status(400).json({ message: validationError });
        }

        const [existing] = await db.query(
            `SELECT image_url FROM Question WHERE question_id = ?`,
            [question_id]
        );

        if (existing.length === 0) {
            if (req.file) removeImageFile('/images/questions/' + req.file.filename);
            return res.status(404).json({ message: 'Question not found.' });
        }

        const { question_text, option_a, option_b, option_c, option_d, correct_answer } = req.body;

        let imageUrl = existing[0].image_url;

        if (req.file) {
            removeImageFile(imageUrl); // drop the old file, if there was one
            imageUrl = '/images/questions/' + req.file.filename;
        } else if (req.body.remove_image === 'true') {
            removeImageFile(imageUrl);
            imageUrl = null;
        }

        await db.query(
            `UPDATE Question
             SET question_text = ?, option_a = ?, option_b = ?, option_c = ?,
                 option_d = ?, correct_answer = ?, image_url = ?
             WHERE question_id = ?`,
            [question_text, option_a, option_b, option_c, option_d, correct_answer, imageUrl, question_id]
        );

        res.json({ message: 'Question updated.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Unable to update question.' });
    }
});

// Remove a question from the active pool (soft delete — keeps game history intact)
router.delete('/api/questions/:question_id', async (req, res) => {
    const { question_id } = req.params;

    try {
        const [existing] = await db.query(
            `SELECT question_id FROM Question WHERE question_id = ?`,
            [question_id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: 'Question not found.' });
        }

        await db.query(`UPDATE Question SET is_active = 0 WHERE question_id = ?`, [question_id]);

        res.json({ message: 'Question removed from the question pool.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Unable to remove question.' });
    }
});

// Restore a previously removed question
router.post('/api/questions/:question_id/restore', async (req, res) => {
    const { question_id } = req.params;

    try {
        const [existing] = await db.query(
            `SELECT question_id FROM Question WHERE question_id = ?`,
            [question_id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: 'Question not found.' });
        }

        await db.query(`UPDATE Question SET is_active = 1 WHERE question_id = ?`, [question_id]);

        res.json({ message: 'Question restored to the question pool.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Unable to restore question.' });
    }
});

module.exports = router;
