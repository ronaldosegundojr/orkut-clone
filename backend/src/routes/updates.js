const express = require('express');
const { db } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get friend IDs
        const friends = await db.allAsync(`
            SELECT CASE WHEN user_id = ? THEN friend_id ELSE user_id END as fid
            FROM friends 
            WHERE (user_id = ? OR friend_id = ?) AND status = 'accepted'
        `, [userId, userId, userId]);

        const friendIds = friends.map(f => f.fid);

        if (friendIds.length === 0) {
            return res.json([]);
        }

        const placeholders = friendIds.map(() => '?').join(',');

        // 1. Get recent scraps written by friends
        const scraps = await db.allAsync(`
            SELECT 'scrap' as type, s.id, s.author_id, u.username as author_username, u.username as author_name, u.avatar as author_avatar, s.text, s.created_at
            FROM scraps s
            JOIN users u ON u.id = s.author_id
            WHERE s.author_id IN (${placeholders})
            ORDER BY s.created_at DESC LIMIT 10
        `, friendIds);

        // 2. Get recent photos uploaded by friends
        const photos = await db.allAsync(`
            SELECT 'photo' as type, p.id, p.owner_id, u.username as owner_username, u.username as owner_name, u.avatar as owner_avatar, p.url, p.caption, p.created_at
            FROM photos p
            JOIN users u ON u.id = p.owner_id
            WHERE p.owner_id IN (${placeholders})
            ORDER BY p.created_at DESC LIMIT 10
        `, friendIds);

        // 3. Get recent videos shared by friends
        const videos = await db.allAsync(`
            SELECT 'video' as type, v.id, v.owner_id, u.username as owner_username, u.username as owner_name, u.avatar as owner_avatar, v.url, v.title, v.views, v.created_at
            FROM videos v
            JOIN users u ON u.id = v.owner_id
            WHERE v.owner_id IN (${placeholders})
            ORDER BY v.created_at DESC LIMIT 10
        `, friendIds);

        // Combine and sort
        const allUpdates = [...scraps, ...photos, ...videos]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 15);

        res.json(allUpdates);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
