const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Search users and communities
router.get('/search', authMiddleware, async (req, res) => {
    try {
        const { q } = req.query;
        const searchTerm = `%${q}%`;

        const users = await db.allAsync(`
            SELECT 'user' as type, id, username as name, avatar, humor, city, country 
            FROM users 
            WHERE username LIKE ? OR email LIKE ? OR city LIKE ? OR details LIKE ?
            LIMIT 15
        `, [searchTerm, searchTerm, searchTerm, searchTerm]);

        const communities = await db.allAsync(`
            SELECT 'community' as type, id, name, image as avatar, description as humor, city, country 
            FROM communities 
            WHERE name LIKE ? OR description LIKE ? OR city LIKE ?
            LIMIT 15
        `, [searchTerm, searchTerm, searchTerm]);

        res.json([...users, ...communities]);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get user profile
router.get('/:idOrUsername', authMiddleware, async (req, res) => {
    try {
        const { idOrUsername } = req.params;
        let user = await db.getAsync('SELECT * FROM users WHERE id = ?', [idOrUsername]);
        if (!user) {
            user = await db.getAsync('SELECT * FROM users WHERE username = ?', [idOrUsername]);
        }
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

        const profileId = user.id;

        if (req.user.id !== profileId) {
            const recent = await db.getAsync('SELECT id FROM profile_views WHERE profile_id = ? AND viewer_id = ? AND viewed_at > datetime("now", "-1 hour")', [profileId, req.user.id]);
            if (!recent) await db.runAsync('INSERT INTO profile_views (id, profile_id, viewer_id) VALUES (?, ?, ?)', [uuidv4(), profileId, req.user.id]);
        }

        const [viewR, scrapR, photoR, videoR, fanR, friendR, votesR, communityR, testimonialR] = await Promise.all([
            db.getAsync('SELECT COUNT(*) as c FROM profile_views WHERE profile_id = ?', [profileId]),
            db.getAsync('SELECT COUNT(*) as c FROM scraps WHERE target_id = ?', [profileId]),
            db.getAsync('SELECT COUNT(*) as c FROM photos WHERE owner_id = ?', [profileId]),
            db.getAsync('SELECT COUNT(*) as c FROM videos WHERE owner_id = ?', [profileId]),
            db.getAsync('SELECT COUNT(*) as c FROM user_votes WHERE target_id = ? AND type = "fan"', [profileId]),
            db.getAsync('SELECT COUNT(*) as c FROM friends WHERE user_id = ? AND status = "accepted"', [profileId]),
            db.allAsync('SELECT type, COUNT(*) as c FROM user_votes WHERE target_id = ? GROUP BY type', [profileId]),
            db.getAsync('SELECT COUNT(*) as c FROM community_members WHERE user_id = ?', [profileId]),
            db.getAsync('SELECT COUNT(*) as c FROM testimonials WHERE target_id = ? AND status = "approved"', [profileId])
        ]);

        const votes = { trusty: 0, cool: 0, sexy: 0 };
        votesR.forEach(r => { if (votes[r.type] !== undefined) votes[r.type] = r.c; });

        const { password_hash, ...safeUser } = user;
        try { safeUser.details = JSON.parse(safeUser.details || '{}'); } catch (e) { safeUser.details = {}; }

        const [isFan, friendship, visitors] = await Promise.all([
            db.getAsync('SELECT id FROM user_votes WHERE target_id = ? AND voter_id = ? AND type = "fan"', [profileId, req.user.id]),
            db.getAsync('SELECT * FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)', [req.user.id, profileId, profileId, req.user.id]),
            db.allAsync('SELECT DISTINCT u.id, u.username, u.avatar, pv.viewed_at FROM profile_views pv JOIN users u ON u.id = pv.viewer_id WHERE pv.profile_id = ? ORDER BY pv.viewed_at DESC LIMIT 10', [profileId]),
        ]);

        res.json({
            ...safeUser,
            stats: {
                views: viewR.c,
                scraps: scrapR.c,
                photos: photoR.c,
                videos: videoR.c,
                fans: fanR.c,
                friends: friendR.c,
                communities: communityR.c,
                testimonials: testimonialR.c,
                ...votes
            },
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
