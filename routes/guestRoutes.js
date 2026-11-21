const express = require('express');
const db = require('../config/db');

const router = express.Router();

router.post('/guest', async (req, res) => {
    const guestName = req.body.guest_name
        ? req.body.guest_name.trim()
        : '';

    try {
        // Reuse the existing guest session if available
        if (req.session.guest) {
            return res.redirect('/rooms');
        }

        if (!guestName) {
            return res.redirect('/login');
        }

        // Generate the next guest ID
        const [ids] = await db.query(
            `SELECT guest_id FROM Guest_Player
             ORDER BY guest_id DESC LIMIT 1`
        );

        const nextId = ids.length > 0
            ? parseInt(ids[0].guest_id.substring(1)) + 1
            : 1;

        const guestId = 'G' + String(nextId).padStart(4, '0');

        // Create a guest record
        await db.query(
            `INSERT INTO Guest_Player (guest_id, guest_name)
             VALUES (?, ?)`,
            [guestId, guestName]
        );

        // Save guest information in the session
        req.session.guest = {
            guest_id: guestId,
            guest_name: guestName
        };

        req.session.save((error) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Unable to save guest session.');
            }

            res.redirect('/rooms');
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Unable to enter as guest.');
    }
});

module.exports = router;
