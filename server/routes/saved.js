const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/', authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT r.* FROM reports r 
             JOIN saved_reports sr ON r.id = sr.report_id 
             WHERE sr.user_id = ?`, 
            [req.user.id]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving saved reports' });
    }
});

// 2. ஒரு புதிய அறிக்கையைச் சேமிக்க (POST /api/saved)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { reportId } = req.body;
        await db.query(
            'INSERT IGNORE INTO saved_reports (user_id, report_id) VALUES (?, ?)',
            [req.user.id, reportId]
        );
        res.status(201).json({ message: 'Report saved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error saving report' });
    }
});

// 3. ஒரு குறிப்பிட்ட அறிக்கையைச் சேமித்த பட்டியலிலிருந்து நீக்க (DELETE /api/saved/:id)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await db.query(
            'DELETE FROM saved_reports WHERE user_id = ? AND report_id = ?',
            [req.user.id, req.params.id]
        );
        res.status(200).json({ message: 'Report removed from saved list' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error removing report' });
    }
});

module.exports = router;