const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const photos = await db.allAsync(`
      SELECT p.*, u.username as owner_name, u.avatar as owner_avatar
      FROM photos p JOIN users u ON u.id = p.owner_id
      ORDER BY p.created_at DESC LIMIT 50
    `);
    res.json(photos);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/user/:userIdOrUsername', authMiddleware, async (req, res) => {
  try {
    const { userIdOrUsername } = req.params;
    let userId = userIdOrUsername;
    
    if (!userIdOrUsername.includes('-') || userIdOrUsername.match(/^[a-zA-Z]/)) {
      const user = await db.getAsync('SELECT id FROM users WHERE username = ?', [userIdOrUsername]);
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
      userId = user.id;
    }
    
    const photos = await db.allAsync(`
      SELECT p.*, u.username as owner_name,
        (SELECT COUNT(*) FROM photo_comments pc WHERE pc.photo_id = p.id) as comment_count
      FROM photos p JOIN users u ON u.id = p.owner_id
      WHERE p.owner_id = ? ORDER BY p.created_at DESC
    `, [userId]);
    res.json(photos);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const photo = await db.getAsync('SELECT * FROM photos WHERE id = ?', [req.params.id]);
    if (!photo) return res.status(404).json({ error: 'Foto não encontrada' });
    const [comments, tags] = await Promise.all([
      db.allAsync('SELECT pc.*, u.username as author_name, u.avatar as author_avatar FROM photo_comments pc JOIN users u ON u.id = pc.author_id WHERE pc.photo_id = ? ORDER BY pc.created_at ASC', [req.params.id]),
      db.allAsync('SELECT u.id, u.username, u.avatar FROM photo_tags pt JOIN users u ON u.id = pt.user_id WHERE pt.photo_id = ?', [req.params.id]),
    ]);
    res.json({ ...photo, comments, tags });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { url, caption, album } = req.body;
    if (!url) return res.status(400).json({ error: 'URL obrigatória' });
    const id = uuidv4();
    await db.runAsync('INSERT INTO photos (id, owner_id, url, caption, album) VALUES (?, ?, ?, ?, ?)', [id, req.user.id, url, caption || '', album || 'Geral']);
    res.json({ id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const photo = await db.getAsync('SELECT * FROM photos WHERE id = ?', [req.params.id]);
    if (!photo) return res.status(404).json({ error: 'Foto não encontrada' });
    if (photo.owner_id !== req.user.id) return res.status(403).json({ error: 'Sem permissão' });
    await db.runAsync('DELETE FROM photos WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const { body } = req.body;
    if (!body) return res.status(400).json({ error: 'Corpo obrigatório' });
    const cid = uuidv4();
    await db.runAsync('INSERT INTO photo_comments (id, photo_id, author_id, body) VALUES (?, ?, ?, ?)', [cid, req.params.id, req.user.id, body]);
    const comment = await db.getAsync('SELECT pc.*, u.username as author_name, u.avatar as author_avatar FROM photo_comments pc JOIN users u ON u.id = pc.author_id WHERE pc.id = ?', [cid]);
    res.json(comment);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/tags', authMiddleware, async (req, res) => {
  try {
    const { user_id } = req.body;
    const exists = await db.getAsync('SELECT id FROM photo_tags WHERE photo_id = ? AND user_id = ?', [req.params.id, user_id]);
    if (exists) return res.status(409).json({ error: 'Usuário já marcado' });
    await db.runAsync('INSERT INTO photo_tags (id, photo_id, user_id) VALUES (?, ?, ?)', [uuidv4(), req.params.id, user_id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
