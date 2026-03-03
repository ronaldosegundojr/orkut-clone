const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/:userId', authMiddleware, async (req, res) => {
    try {
        const fans = await db.allAsync(`
      SELECT u.id, u.username, u.avatar FROM fans f
      JOIN users u ON u.id = f.fan_id WHERE f.user_id = ?
    `, [req.params.userId]);
        res.json(fans);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { user_id } = req.body;
        if (user_id === req.user.id) return res.status(400).json({ error: 'Não pode ser fã de si mesmo' });
        const exists = await db.getAsync('SELECT id FROM fans WHERE user_id = ? AND fan_id = ?', [user_id, req.user.id]);
        if (exists) return res.status(409).json({ error: 'Já é fã' });
        await db.runAsync('INSERT INTO fans (id, user_id, fan_id) VALUES (?, ?, ?)', [uuidv4(), user_id, req.user.id]);
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:userId', authMiddleware, async (req, res) => {
    try {
        await db.runAsync('DELETE FROM fans WHERE user_id = ? AND fan_id = ?', [req.params.userId, req.user.id]);
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
