const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const videos = await db.allAsync(`
      SELECT v.*, u.username as owner_name, u.avatar as owner_avatar
      FROM videos v JOIN users u ON u.id = v.owner_id
      ORDER BY v.created_at DESC LIMIT 50
    `);
    res.json(videos);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const videos = await db.allAsync(`
      SELECT v.*, u.username as owner_name,
        (SELECT COUNT(*) FROM video_comments vc WHERE vc.video_id = v.id) as comment_count
      FROM videos v JOIN users u ON u.id = v.owner_id
      WHERE v.owner_id = ? ORDER BY v.created_at DESC
    `, [req.params.userId]);
    res.json(videos);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const video = await db.getAsync('SELECT * FROM videos WHERE id = ?', [req.params.id]);
    if (!video) return res.status(404).json({ error: 'Vídeo não encontrado' });
    await db.runAsync('UPDATE videos SET views = views + 1 WHERE id = ?', [req.params.id]);
    const comments = await db.allAsync('SELECT vc.*, u.username as author_name, u.avatar as author_avatar FROM video_comments vc JOIN users u ON u.id = vc.author_id WHERE vc.video_id = ? ORDER BY vc.created_at ASC', [req.params.id]);
    res.json({ ...video, views: video.views + 1, comments });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { url, title } = req.body;
    if (!url || !title) return res.status(400).json({ error: 'URL e título obrigatórios' });
    const id = uuidv4();
    await db.runAsync('INSERT INTO videos (id, owner_id, url, title) VALUES (?, ?, ?, ?)', [id, req.user.id, url, title]);
    res.json({ id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const { body } = req.body;
    if (!body) return res.status(400).json({ error: 'Corpo obrigatório' });
    const cid = uuidv4();
    await db.runAsync('INSERT INTO video_comments (id, video_id, author_id, body) VALUES (?, ?, ?, ?)', [cid, req.params.id, req.user.id, body]);
    const comment = await db.getAsync('SELECT vc.*, u.username as author_name, u.avatar as author_avatar FROM video_comments vc JOIN users u ON u.id = vc.author_id WHERE vc.id = ?', [cid]);
    res.json(comment);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
