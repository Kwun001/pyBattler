const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/db');

const router = express.Router();

// Email format validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password must contain at least 8 characters,
// one uppercase, one lowercase, one number and one symbol
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/;

//Lock admin edit profile feature
const { LOCK_ADMIN_CREDENTIALS } = require('../config/settings');

// Display profile
router.get('/', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    try {
        const userId = req.session.user.user_id;

        // Get user information
        const [users] = await db.query(
            `SELECT user_id, username, email
             FROM User
             WHERE user_id = ?`,
            [userId]
        );

        if (users.length === 0) {
            return res.redirect('/login');
        }

        // Get player statistics
        const [statistics] = await db.query(
            `SELECT
                COUNT(DISTINCT room_id) AS total_games,
                COALESCE(SUM(score), 0) AS total_score
             FROM Participant
             WHERE user_id = ?`,
            [userId]
        );

        // Get game history
        const [history] = await db.query(
            `SELECT
                p.room_id,
                r.created_at,
                p.score,
                CASE
                    WHEN p.hp > 0 AND p.is_alive = TRUE THEN 'Alive'
                    ELSE 'Eliminated'
                END AS player_status
             FROM Participant p
             JOIN Room r ON p.room_id = r.room_id
             WHERE p.user_id = ?
             ORDER BY r.created_at DESC`,
            [userId]
        );

        res.render('profile', {
            title: 'My Profile',
            user: users[0],
            statistics: statistics[0],
            history,
            message: req.query.message || null,
            lockAdminCredentials: LOCK_ADMIN_CREDENTIALS
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Unable to load profile.');
    }
});

// Update profile
router.post('/update', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const userId = req.session.user.user_id;

    const {
        username,
        email,
        currentPassword,
        newPassword,
        confirmPassword
    } = req.body;

    try {
        // Get current account information
        const [users] = await db.query(
            'SELECT * FROM User WHERE user_id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.redirect('/login');
        }

        const user = users[0];

        //control admin edit profile feature
        if (user.role === 'admin' && LOCK_ADMIN_CREDENTIALS && (email !== user.email || newPassword)) {
            return res.redirect('/profile?message=admin_locked');
        }


        // Current password is required for every profile update
        if (!currentPassword) {
            return res.redirect('/profile?message=wrong_password');
        }

        // Validate current password
        const passwordMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!passwordMatch) {
            return res.redirect('/profile?message=wrong_password');
        }

        // Keep existing values if the fields are left empty
        const newUsername = username
            ? username.trim()
            : user.username;

        const newEmail = email
            ? email.trim().toLowerCase()
            : user.email;

        // Validate username
        if (!newUsername) {
            return res.redirect('/profile?message=empty_fields');
        }

        // Validate email format
        if (!emailRegex.test(newEmail)) {
            return res.redirect('/profile?message=invalid_email');
        }

        // Check whether username or email is already used
        const [existing] = await db.query(
            `SELECT user_id
             FROM User
             WHERE (username = ? OR email = ?)
             AND user_id != ?`,
            [newUsername, newEmail, userId]
        );

        if (existing.length > 0) {
            return res.redirect('/profile?message=account_exists');
        }

        // Keep the current password unless a new one is provided
        let updatedPassword = user.password;

        if (newPassword) {
            // Validate new password strength
            if (!passwordRegex.test(newPassword)) {
                return res.redirect('/profile?message=weak_password');
            }

            // Check password confirmation
            if (newPassword !== confirmPassword) {
                return res.redirect('/profile?message=password_mismatch');
            }

            // Hash the new password
            updatedPassword = await bcrypt.hash(newPassword, 10);

        } else if (confirmPassword) {
            return res.redirect('/profile?message=password_mismatch');
        }

        // Update account information
        await db.query(
            `UPDATE User
             SET username = ?, email = ?, password = ?
             WHERE user_id = ?`,
            [newUsername, newEmail, updatedPassword, userId]
        );

        // Update session information
        req.session.user.username = newUsername;
        req.session.user.email = newEmail;

        res.redirect('/profile?message=updated');

    } catch (error) {
        console.error('Profile update failed:', error);
        res.redirect('/profile?message=update_failed');
    }
});

module.exports = router;
