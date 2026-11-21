const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/db');

const router = express.Router();

// Email format validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password must contain at least 8 characters, 
// one uppercase, one lowercase, one number and one symbol
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/;

// Redirect to login page with an error message
function redirectWithLoginError(req, res, message) {
    req.session.loginError = message;

    req.session.save((error) => {
        if (error) {
            console.error('Login error session save failed:', error);
            return res.status(500).send('Unable to process login. Please try again.');
        }

        res.redirect(303, '/login');
    });
}

// Signup Page
router.get('/signup', (req, res) => {
    res.render('signup', {
        title: 'Sign up',
        error: null
    });
});

// Check whether an email is already registered
router.get('/api/users/check-email', async (req, res) => {
    const email = (req.query.email || '').trim().toLowerCase();

    if (!emailRegex.test(email)) {
        return res.json({
            valid: false,
            available: false
        });
    }

    try {
        let query = 'SELECT user_id FROM User WHERE email = ?';
        let values = [email];

        // When checking from the profile page,
        // exclude the currently logged-in user's email
        if (req.session.user) {
            query += ' AND user_id != ?';
            values.push(req.session.user.user_id);
        }

        const [existing] = await db.query(query, values);

        res.json({
            valid: true,
            available: existing.length === 0
        });

    } catch (error) {
        console.error('Email check failed:', error);

        res.status(500).json({
            valid: false,
            available: false
        });
    }
});

// Register Account
router.post('/signup', async (req, res) => {
    const username = (req.body.username || '').trim();
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';

    try {
        // Check required fields
        if (!username || !email || !password) {
            return res.status(400).render('signup', {
                title: 'Sign up',
                error: 'Please fill in all required fields.'
            });
        }

        // Validate email format
        if (!emailRegex.test(email)) {
            return res.status(400).render('signup', {
                title: 'Sign up',
                error: 'Please enter a valid email address.'
            });
        }

        // Validate password strength
        if (!passwordRegex.test(password)) {
            return res.status(400).render('signup', {
                title: 'Sign up',
                error: 'Password must contain at least 8 characters, including uppercase, lowercase, a number and a symbol.'
            });
        }

        // Check whether username or email already exists
        const [existing] = await db.query(
            'SELECT user_id FROM User WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existing.length > 0) {
            return res.status(400).render('signup', {
                title: 'Sign up',
                error: 'Username or email already exists.'
            });
        }

        // Generate the next user ID
        const [ids] = await db.query(
            'SELECT user_id FROM User ORDER BY user_id DESC LIMIT 1'
        );

        const nextId = ids.length > 0
            ? parseInt(ids[0].user_id.substring(1)) + 1
            : 1;

        const userId = 'U' + String(nextId).padStart(4, '0');

        // Hash password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user into database
        await db.query(
            `INSERT INTO User (user_id, username, email, password)
             VALUES (?, ?, ?, ?)`,
            [userId, username, email, hashedPassword]
        );

        res.redirect('/login?registered=1');

    } catch (error) {
        console.error('Signup failed:', error);

        
        res.status(500).render('signup', {
            title: 'Sign up',
            error: 'Registration failed. Please try again.'
        });
    }
});

// Login Page
router.get('/login', (req, res) => {
    let error = req.session.loginError || null;

    // Remove the stored error after retrieving it
    delete req.session.loginError;

    // Display session expiry message if applicable
    if (req.query.session === 'expired') {
        error = 'Your account was logged in on another device. Please log in again.';
    }

    res.render('login', {
        title: 'Login',
        error: error,
        registered: req.query.registered
    });
});

// Login Account
router.post('/login', async (req, res) => {
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';

    try {
        // Check required fields
        if (!email || !password || !emailRegex.test(email)) {
            return redirectWithLoginError(
                req,
                res,
                'Invalid email or password.'
            );
        }

        // Find user by email
        const [users] = await db.query(
            'SELECT * FROM User WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return redirectWithLoginError(
                req,
                res,
                'Account does not exist. Please sign up first.'
            );
        }

        const user = users[0];
        // Compare entered password with hashed password
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return redirectWithLoginError(
                req,
                res,
                'Invalid email or password. Please try again'
            );
        }
        // Create a new session ID after successful login
        req.session.regenerate(async (error) => {
            if (error) {
                console.error('Session regeneration failed:', error);

                return res.status(500).send(
                    'Login failed. Please try again.'
                );
            }
            try {
                // Save the new session ID in the database.
                await db.query(
                    'UPDATE User SET active_session_id = ? WHERE user_id = ?',
                    [req.sessionID, user.user_id]
                );
                // Store user information in the new session
                req.session.user = {
                    user_id: user.user_id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                };
                req.session.save((saveError) => {
                    if (saveError) {
                        console.error('Session save failed:', saveError);

                        return res.status(500).send(
                            'Login failed. Please try again.'
                        );
                    }
                    res.redirect(user.role === 'admin' ? '/admin' : '/rooms');
                });

            } catch (databaseError) {
                console.error('Login session update failed:', databaseError);

                req.session.destroy(() => {
                    res.status(500).send('Login failed. Please try again.');
                });
            }
        });

    } catch (error) {
        console.error('Login failed:', error);

        return redirectWithLoginError(
            req,
            res,
            'Login failed. Please try again.'
        );
    }
});

// Logout
router.post('/logout', async (req, res) => {
    try {
        if (req.session.user) {
            // Only clear the session ID if it belongs to this device
            await db.query(
                `UPDATE User
                 SET active_session_id = NULL
                 WHERE user_id = ? AND active_session_id = ?`,
                [req.session.user.user_id, req.sessionID]
            );
        }

        req.session.destroy(() => {
            res.redirect('/login');
        });

    } catch (error) {
        console.error('Logout failed:', error);

        req.session.destroy(() => {
            res.redirect('/login');
        });
    }
});

module.exports = router;
