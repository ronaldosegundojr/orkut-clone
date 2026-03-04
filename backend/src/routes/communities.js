const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    const sql = q
      ? `SELECT c.*, u.username as owner_name, (SELECT COUNT(*) FROM community_members cm WHERE cm.community_id = c.id) as member_count FROM communities c JOIN users u ON u.id = c.owner_id WHERE c.name LIKE ? OR c.description LIKE ? ORDER BY member_count DESC`
      : `SELECT c.*, u.username as owner_name, (SELECT COUNT(*) FROM community_members cm WHERE cm.community_id = c.id) as member_count FROM communities c JOIN users u ON u.id = c.owner_id ORDER BY member_count DESC`;
    const params = q ? [`%${q}%`, `%${q}%`] : [];
    const communities = await db.allAsync(sql, params);
    const result = await Promise.all(communities.map(async c => ({
      ...c,
      isMember: !!(await db.getAsync('SELECT id FROM community_members WHERE community_id = ? AND user_id = ?', [c.id, req.user.id]))
    })));
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const communities = await db.allAsync(`
      SELECT c.*, u.username as owner_name,
        (SELECT COUNT(*) FROM community_members cm2 WHERE cm2.community_id = c.id) as member_count
      FROM communities c JOIN community_members cm ON cm.community_id = c.id
      JOIN users u ON u.id = c.owner_id WHERE cm.user_id = ?
    `, [req.user.id]);
    res.json(communities);
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
    
    const communities = await db.allAsync(`
      SELECT c.*, u.username as owner_name,
        (SELECT COUNT(*) FROM community_members cm2 WHERE cm2.community_id = c.id) as member_count
      FROM communities c JOIN community_members cm ON cm.community_id = c.id
      JOIN users u ON u.id = c.owner_id WHERE cm.user_id = ?
    `, [userId]);
    res.json(communities);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id/members', authMiddleware, async (req, res) => {
  try {
    const members = await db.allAsync(`
      SELECT u.id, u.username, u.avatar, u.humor, cm.role
      FROM community_members cm
      JOIN users u ON u.id = cm.user_id
      WHERE cm.community_id = ?
      ORDER BY cm.role DESC, u.username ASC
    `, [req.params.id]);
    res.json(members);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const c = await db.getAsync(`
      SELECT c.*, u.username as owner_name, u.username as owner_username,
        (SELECT COUNT(*) FROM community_members cm WHERE cm.community_id = c.id) as member_count
      FROM communities c JOIN users u ON u.id = c.owner_id WHERE c.id = ?
    `, [req.params.id]);
    if (!c) return res.status(404).json({ error: 'Comunidade não encontrada' });
    const [members, topics, isMemberRow] = await Promise.all([
      db.allAsync(`SELECT u.id, u.username, u.avatar FROM community_members cm JOIN users u ON u.id = cm.user_id WHERE cm.community_id = ? LIMIT 9`, [req.params.id]),
      db.allAsync(`SELECT ft.*, u.username as author_name, u.avatar as author_avatar, u.username as author_username, (SELECT COUNT(*) FROM forum_comments fc WHERE fc.topic_id = ft.id) as comment_count FROM forum_topics ft JOIN users u ON u.id = ft.author_id WHERE ft.community_id = ? ORDER BY ft.created_at DESC`, [req.params.id]),
      db.getAsync('SELECT id FROM community_members WHERE community_id = ? AND user_id = ?', [req.params.id, req.user.id]),
    ]);
    res.json({ ...c, members, topics, isMember: !!isMemberRow });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, image, category } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome obrigatório' });
    const id = uuidv4();
    await db.runAsync('INSERT INTO communities (id, name, description, image, owner_id, category) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, description || '', image || `https://i.pravatar.cc/150?u=${id}`, req.user.id, category || 'Geral']);
    await db.runAsync('INSERT INTO community_members (id, community_id, user_id) VALUES (?, ?, ?)', [uuidv4(), id, req.user.id]);
    res.json({ id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/join', authMiddleware, async (req, res) => {
  try {
    const exists = await db.getAsync('SELECT id FROM community_members WHERE community_id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (exists) return res.status(409).json({ error: 'Já é membro' });
    await db.runAsync('INSERT INTO community_members (id, community_id, user_id) VALUES (?, ?, ?)', [uuidv4(), req.params.id, req.user.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id/leave', authMiddleware, async (req, res) => {
  try {
    await db.runAsync('DELETE FROM community_members WHERE community_id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/topics', authMiddleware, async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title || !body) return res.status(400).json({ error: 'Título e corpo obrigatórios' });
    const id = uuidv4();
    await db.runAsync('INSERT INTO forum_topics (id, community_id, author_id, title, body) VALUES (?, ?, ?, ?, ?)', [id, req.params.id, req.user.id, title, body]);
    const topic = await db.getAsync('SELECT ft.*, u.username as author_name, u.avatar as author_avatar FROM forum_topics ft JOIN users u ON u.id = ft.author_id WHERE ft.id = ?', [id]);
    res.json(topic);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id/topics/:topicId', authMiddleware, async (req, res) => {
  try {
    const topic = await db.getAsync('SELECT ft.*, u.username as author_name, u.avatar as author_avatar, u.username as author_username FROM forum_topics ft JOIN users u ON u.id = ft.author_id WHERE ft.id = ?', [req.params.topicId]);
    if (!topic) return res.status(404).json({ error: 'Tópico não encontrado' });
    const comments = await db.allAsync('SELECT fc.*, u.username as author_name, u.avatar as author_avatar, u.username as author_username FROM forum_comments fc JOIN users u ON u.id = fc.author_id WHERE fc.topic_id = ? ORDER BY fc.created_at ASC', [req.params.topicId]);
    res.json({ ...topic, comments });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/topics/:topicId/comments', authMiddleware, async (req, res) => {
  try {
    const { body } = req.body;
    if (!body) return res.status(400).json({ error: 'Corpo obrigatório' });
    const id = uuidv4();
    await db.runAsync('INSERT INTO forum_comments (id, topic_id, author_id, body) VALUES (?, ?, ?, ?)', [id, req.params.topicId, req.user.id, body]);
    const comment = await db.getAsync('SELECT fc.*, u.username as author_name, u.avatar as author_avatar, u.username as author_username FROM forum_comments fc JOIN users u ON u.id = fc.author_id WHERE fc.id = ?', [id]);
    res.json(comment);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
