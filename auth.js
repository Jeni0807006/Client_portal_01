const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';


// =============================
// AUTH MIDDLEWARE
// =============================
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access Denied: No Token Provided!' });
    }

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or Expired Token!' });
    }
};


// =============================
// REGISTER USER
// =============================
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const [existing] = await db.execute(
            'SELECT * FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.execute(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        res.status(201).json({ message: 'User registered successfully' });

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});


// =============================
// LOGIN USER
// =============================
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
    }

    try {
        const [users] = await db.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});


// =============================
// LOGOUT USER (CLIENT HANDLED)
// =============================
router.post('/logout', (req, res) => {
    res.status(200).json({
        message: 'Logout successful. Remove token from client.'
    });
});


// =============================
// GET USER PROFILE
// =============================
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const [rows] = await db.execute(
            'SELECT id, username, email FROM users WHERE id = ?',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(rows[0]);

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});


// =============================
// SAVE REPORT
// =============================
router.post('/saved', authenticateToken, async (req, res) => {
    const { reportId } = req.body;
    const userId = req.user.userId;

    if (!reportId) {
        return res.status(400).json({ message: 'Report ID required' });
    }

    try {
        const [existing] = await db.execute(
            'SELECT * FROM saved_reports WHERE user_id = ? AND report_id = ?',
            [userId, reportId]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Already saved' });
        }

        await db.execute(
            'INSERT INTO saved_reports (user_id, report_id) VALUES (?, ?)',
            [userId, reportId]
        );

        res.status(201).json({ message: 'Report saved' });

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});


// =============================
// GET SAVED REPORTS
// =============================
router.get('/saved', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    try {
        const [rows] = await db.execute(
            'SELECT report_id AS reportId FROM saved_reports WHERE user_id = ?',
            [userId]
        );

        res.status(200).json(rows);

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});


// =============================
// DELETE SINGLE SAVED REPORT
// =============================
router.delete('/saved/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const reportId = req.params.id;

        await db.execute(
            'DELETE FROM saved_reports WHERE user_id = ? AND report_id = ?',
            [userId, reportId]
        );

        res.status(200).json({ message: 'Saved report removed' });

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});


// =============================
// CLEAR ALL SAVED REPORTS
// =============================
router.delete('/saved', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        await db.execute(
            'DELETE FROM saved_reports WHERE user_id = ?',
            [userId]
        );

        res.status(200).json({ message: 'All saved reports cleared' });

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;