const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const convos = await db.allAsync(`
      SELECT
        CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END as other_id,
        u.username as other_name, u.avatar as other_avatar,
        u.username as other_username,
        m.body as last_message, m.created_at as last_time,
        SUM(CASE WHEN m.receiver_id = ? AND m.read = 0 THEN 1 ELSE 0 END) as unread
      FROM messages m
      JOIN users u ON u.id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END
      WHERE (m.sender_id = ? AND m.deleted_by_sender = 0) OR (m.receiver_id = ? AND m.deleted_by_receiver = 0)
      GROUP BY other_id
      ORDER BY last_time DESC
    `, [req.user.id, req.user.id, req.user.id, req.user.id, req.user.id]);
    res.json(convos);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/with/:userIdOrUsername', authMiddleware, async (req, res) => {
  try {
    const { userIdOrUsername } = req.params;
    let targetId = userIdOrUsername;

    if (!userIdOrUsername.includes('-') || userIdOrUsername.match(/^[a-zA-Z]/)) {
      const user = await db.getAsync('SELECT id FROM users WHERE username = ?', [userIdOrUsername]);
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
      targetId = user.id;
    }

    const messages = await db.allAsync(`
      SELECT m.*, u.username as sender_name, u.avatar as sender_avatar
      FROM messages m JOIN users u ON u.id = m.sender_id
      WHERE 
        (m.sender_id = ? AND m.receiver_id = ? AND m.deleted_by_sender = 0) 
        OR 
        (m.sender_id = ? AND m.receiver_id = ? AND m.deleted_by_receiver = 0)
      ORDER BY m.created_at ASC
    `, [req.user.id, targetId, targetId, req.user.id]);
    await db.runAsync('UPDATE messages SET read = 1 WHERE sender_id = ? AND receiver_id = ?', [targetId, req.user.id]);
    res.json(messages);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { receiver_id, body, type } = req.body;
    if (!receiver_id || !body) return res.status(400).json({ error: 'receiver_id e body obrigatórios' });
    const id = uuidv4();
    await db.runAsync('INSERT INTO messages (id, sender_id, receiver_id, body, type, deleted_by_sender, deleted_by_receiver) VALUES (?, ?, ?, ?, ?, 0, 0)', [id, req.user.id, receiver_id, body, type || 'text']);
    const msg = await db.getAsync('SELECT m.*, u.username as sender_name, u.avatar as sender_avatar FROM messages m JOIN users u ON u.id = m.sender_id WHERE m.id = ?', [id]);
    res.json(msg);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/unread', authMiddleware, async (req, res) => {
  try {
    const result = await db.getAsync('SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND read = 0 AND deleted_by_receiver = 0', [req.user.id]);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/with/:targetId', authMiddleware, async (req, res) => {
  try {
    const targetId = req.params.targetId;
    await db.runAsync('UPDATE messages SET deleted_by_sender = 1 WHERE sender_id = ? AND receiver_id = ?', [req.user.id, targetId]);
    await db.runAsync('UPDATE messages SET deleted_by_receiver = 1 WHERE receiver_id = ? AND sender_id = ?', [req.user.id, targetId]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/all', authMiddleware, async (req, res) => {
  try {
    await db.runAsync('UPDATE messages SET deleted_by_sender = 1 WHERE sender_id = ?', [req.user.id]);
    await db.runAsync('UPDATE messages SET deleted_by_receiver = 1 WHERE receiver_id = ?', [req.user.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:msgId', authMiddleware, async (req, res) => {
  try {
    const msgId = req.params.msgId;
    await db.runAsync('DELETE FROM messages WHERE id = ? AND sender_id = ?', [msgId, req.user.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
