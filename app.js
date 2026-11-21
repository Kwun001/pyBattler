require('dotenv').config();

// 1. Import Dependencies
const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./config/db');

// 2. Initialize the App
const app = express();
const PORT = process.env.PORT || 3000;

// 3. Set Up Middleware
// Serve static files (CSS, JS, images) from the public folder
app.use(express.static(path.join(__dirname, 'public')));

//Parse form and JSON request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessions
app.use(session({
    secret: process.env.SESSION_SECRET || 'pybattler-secret-key',
    resave: false,
    saveUninitialized: false
}));

//Check the user's session is still active (single active login per user)
app.use(async function (req, res, next) {
    try {
        if (req.session.user) {
            const [users] = await db.query(
                `SELECT active_session_id
                 FROM User
                 WHERE user_id = ?`,
                [req.session.user.user_id]
            );

            // User no longer exists or logged in on another device
            if (users.length === 0 || users[0].active_session_id !== req.sessionID) {
                return req.session.destroy(function () {
                    res.redirect('/login?session=expired');
                });
            }
        }

        // Make the logged-in user / guest available in every Pug template
        res.locals.currentUser = req.session.user || null;
        res.locals.sessionGuest = req.session.guest || null;

        next();
    } catch (error) {
        console.error('Session validation failed:', error);
        res.status(500).send('Unable to validate user session.');
    }
});

// 4. Set Up View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// 5. Define Routes
// Home page
app.get('/', function (req, res) {
    res.redirect('/login');
});

// Feature routes
app.use('/', require('./routes/authRoutes'));
app.use('/', require('./routes/guestRoutes'));
app.use('/rooms', require('./routes/roomRoutes'));
app.use('/lobby', require('./routes/lobbyRoutes'));
app.use('/game', require('./routes/gameRoutes'));
app.use('/turn', require('./routes/turnRoutes'));
app.use('/scan', require('./routes/scanRoutes'));
app.use('/question', require('./routes/questionRoutes'));
app.use('/action', require('./routes/actionRoutes'));
app.use('/result', require('./routes/resultRoutes'));
app.use('/leaderboard', require('./routes/leaderboardRoutes'));
app.use('/profile', require('./routes/profileRoutes'));
app.use('/admin', require('./routes/requireAdmin'), require('./routes/adminRoutes'));

// Catch errors from multer (bad file type, file too large) on the admin routes
app.use('/admin', function (error, req, res, next) {
    if (error) {
        return res.status(400).json({ message: error.message || 'Upload failed.' });
    }
    next();
});

// 6. Start the Server
// Check the database connection
db.getConnection()
    .then(function (connection) {
        console.log('MySQL connected successfully');
        connection.release();
    })
    .catch(function (error) {
        console.error('MySQL connection failed:', error);
    });

app.listen(PORT, function () {
    console.log(`pyBattler running at http://localhost:${PORT}`);
});
