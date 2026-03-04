const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/requests/pending', authMiddleware, async (req, res) => {
  try {
    const requests = await db.allAsync(`
      SELECT f.id, f.user_id, f.created_at, u.username, u.avatar, u.humor
      FROM friends f JOIN users u ON u.id = f.user_id
      WHERE f.friend_id = ? AND f.status = 'pending'
      ORDER BY f.created_at DESC
    `, [req.user.id]);
    res.json(requests);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:userIdOrUsername', authMiddleware, async (req, res) => {
  try {
    const { userIdOrUsername } = req.params;
    let userId = userIdOrUsername;
    
    if (!userIdOrUsername.includes('-') || userIdOrUsername.match(/^[a-zA-Z]/)) {
      const user = await db.getAsync('SELECT id FROM users WHERE username = ?', [userIdOrUsername]);
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
      userId = user.id;
    }
    
    const friends = await db.allAsync(`
      SELECT u.id, u.username, u.avatar, u.humor, u.city,
        f.id as friendship_id, f.status
      FROM friends f
      JOIN users u ON u.id = f.friend_id
      WHERE f.user_id = ? AND f.status = 'accepted'
      ORDER BY u.username
    `, [userId]);
    res.json(friends);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/request', authMiddleware, async (req, res) => {
  try {
    const { friend_id } = req.body;
    if (friend_id === req.user.id) return res.status(400).json({ error: 'Não pode adicionar a si mesmo' });
    const exists = await db.getAsync('SELECT id FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)', [req.user.id, friend_id, friend_id, req.user.id]);
    if (exists) return res.status(409).json({ error: 'Solicitação já existe' });
    const id = uuidv4();
    await db.runAsync('INSERT INTO friends (id, user_id, friend_id, status) VALUES (?, ?, ?, "pending")', [id, req.user.id, friend_id]);
    res.json({ id, status: 'pending' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const f = await db.getAsync('SELECT * FROM friends WHERE id = ?', [req.params.id]);
    if (!f) return res.status(404).json({ error: 'Solicitação não encontrada' });
    if (f.friend_id !== req.user.id) return res.status(403).json({ error: 'Sem permissão' });
    if (status === 'accepted') {
      await db.runAsync('UPDATE friends SET status = "accepted" WHERE id = ?', [req.params.id]);
      const mirror = await db.getAsync('SELECT id FROM friends WHERE user_id = ? AND friend_id = ?', [f.friend_id, f.user_id]);
      if (!mirror) await db.runAsync('INSERT INTO friends (id, user_id, friend_id, status) VALUES (?, ?, ?, "accepted")', [uuidv4(), f.friend_id, f.user_id]);
    } else {
      await db.runAsync('DELETE FROM friends WHERE id = ?', [req.params.id]);
    }
    res.json({ ok: true, status });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:friendId', authMiddleware, async (req, res) => {
  try {
    await db.runAsync('DELETE FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)', [req.user.id, req.params.friendId, req.params.friendId, req.user.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/suggestions/:userId', authMiddleware, async (req, res) => {
  try {
    const myFriends = await db.allAsync(`
      SELECT CASE WHEN user_id = ? THEN friend_id ELSE user_id END as fid
      FROM friends WHERE (user_id = ? OR friend_id = ?) AND status = 'accepted'
    `, [req.params.userId, req.params.userId, req.params.userId]);
    const myFriendIds = myFriends.map(r => r.fid);
    const alreadyConnected = [req.params.userId, ...myFriendIds];
    const placeholders = alreadyConnected.map(() => '?').join(',');
    const suggestions = await db.allAsync(`
      SELECT id, username, avatar, humor FROM users
      WHERE id NOT IN (${placeholders}) LIMIT 5
    `, alreadyConnected);
    res.json(suggestions);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
