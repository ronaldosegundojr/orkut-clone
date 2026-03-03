const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Search users
router.get('/search', authMiddleware, async (req, res) => {
    try {
        const { q } = req.query;
        const users = await db.allAsync('SELECT id, username, email, avatar, humor, city, country FROM users WHERE username LIKE ? OR email LIKE ? LIMIT 20', [`%${q}%`, `%${q}%`]);
        res.json(users);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get user profile
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const user = await db.getAsync('SELECT * FROM users WHERE id = ?', [req.params.id]);
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

        if (req.user.id !== req.params.id) {
            const recent = await db.getAsync('SELECT id FROM profile_views WHERE profile_id = ? AND viewer_id = ? AND viewed_at > datetime("now", "-1 hour")', [req.params.id, req.user.id]);
            if (!recent) await db.runAsync('INSERT INTO profile_views (id, profile_id, viewer_id) VALUES (?, ?, ?)', [uuidv4(), req.params.id, req.user.id]);
        }

        const [viewR, scrapR, photoR, videoR, fanR, friendR, votesR] = await Promise.all([
            db.getAsync('SELECT COUNT(*) as c FROM profile_views WHERE profile_id = ?', [req.params.id]),
            db.getAsync('SELECT COUNT(*) as c FROM scraps WHERE target_id = ?', [req.params.id]),
            db.getAsync('SELECT COUNT(*) as c FROM photos WHERE owner_id = ?', [req.params.id]),
            db.getAsync('SELECT COUNT(*) as c FROM videos WHERE owner_id = ?', [req.params.id]),
            db.getAsync('SELECT COUNT(*) as c FROM fans WHERE user_id = ?', [req.params.id]),
            db.getAsync('SELECT COUNT(*) as c FROM friends WHERE (user_id = ? OR friend_id = ?) AND status = "accepted"', [req.params.id, req.params.id]),
            db.allAsync('SELECT type, COUNT(*) as c FROM user_votes WHERE target_id = ? GROUP BY type', [req.params.id])
        ]);

        const votes = { trusty: 0, cool: 0, sexy: 0 };
        votesR.forEach(r => { if (votes[r.type] !== undefined) votes[r.type] = r.c; });

        const [isFan, friendship, visitors] = await Promise.all([
            db.getAsync('SELECT id FROM fans WHERE user_id = ? AND fan_id = ?', [req.params.id, req.user.id]),
            db.getAsync('SELECT * FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)', [req.user.id, req.params.id, req.params.id, req.user.id]),
            db.allAsync('SELECT DISTINCT u.id, u.username, u.avatar, pv.viewed_at FROM profile_views pv JOIN users u ON u.id = pv.viewer_id WHERE pv.profile_id = ? ORDER BY pv.viewed_at DESC LIMIT 10', [req.params.id]),
        ]);

        const { password_hash, ...safeUser } = user;
        try { safeUser.details = JSON.parse(safeUser.details || '{}'); } catch (e) { safeUser.details = {}; }

        res.json({
            ...safeUser,
            stats: { views: viewR.c, scraps: scrapR.c, photos: photoR.c, videos: videoR.c, fans: fanR.c, friends: friendR.c, ...votes },
            isFan: !!isFan,
            friendship: friendship || null,
            visitors
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Update profile
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        if (req.user.id !== req.params.id) return res.status(403).json({ error: 'Sem permissão' });
        const { username, humor, bio, avatar, city, country, relationship, details } = req.body;

        const detailsStr = details ? JSON.stringify(details) : undefined;

        await db.runAsync('UPDATE users SET username = COALESCE(?, username), humor = COALESCE(?, humor), bio = COALESCE(?, bio), avatar = COALESCE(?, avatar), city = COALESCE(?, city), country = COALESCE(?, country), relationship = COALESCE(?, relationship), details = COALESCE(?, details) WHERE id = ?',
            [username, humor, bio, avatar, city, country, relationship, detailsStr, req.params.id]);

        const user = await db.getAsync('SELECT * FROM users WHERE id = ?', [req.params.id]);
        const { password_hash, ...safe } = user;
        try { safe.details = JSON.parse(safe.details || '{}'); } catch (e) { safe.details = {}; }
        res.json(safe);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Vote in profile
router.post('/:id/vote', authMiddleware, async (req, res) => {
    try {
        const { type } = req.body; // trusty, cool, sexy
        if (req.user.id === req.params.id) return res.status(400).json({ error: 'Você não pode votar em si mesmo' });
        if (!['trusty', 'cool', 'sexy'].includes(type)) return res.status(400).json({ error: 'Tipo inválido' });

        const existing = await db.getAsync('SELECT id FROM user_votes WHERE voter_id = ? AND target_id = ? AND type = ?', [req.user.id, req.params.id, type]);
        if (existing) return res.status(400).json({ error: 'Você já votou neste usuário para este atributo' });

        await db.runAsync('INSERT INTO user_votes (id, voter_id, target_id, type) VALUES (?, ?, ?, ?)', [uuidv4(), req.user.id, req.params.id, type]);
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
