const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/:userIdOrUsername', authMiddleware, async (req, res) => {
  try {
    const { userIdOrUsername } = req.params;
    let targetId = userIdOrUsername;
    
    // Check if it's a username instead of id
    if (!userIdOrUsername.includes('-') || userIdOrUsername.match(/^[a-zA-Z]/)) {
      const user = await db.getAsync('SELECT id FROM users WHERE username = ?', [userIdOrUsername]);
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
      targetId = user.id;
    }
    
    const scraps = await db.allAsync(`
      SELECT s.*, u.username as author_name, u.avatar as author_avatar, u.username as author_username
      FROM scraps s JOIN users u ON u.id = s.author_id
      WHERE s.target_id = ? ORDER BY s.created_at DESC LIMIT 50
    `, [targetId]);
    res.json(scraps);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { target_id, text } = req.body;
    if (!target_id || !text) return res.status(400).json({ error: 'target_id e text são obrigatórios' });
    const id = uuidv4();
    await db.runAsync('INSERT INTO scraps (id, author_id, target_id, text) VALUES (?, ?, ?, ?)', [id, req.user.id, target_id, text]);
    const scrap = await db.getAsync(`
      SELECT s.*, u.username as author_name, u.avatar as author_avatar
      FROM scraps s JOIN users u ON u.id = s.author_id WHERE s.id = ?
    `, [id]);
    res.json(scrap);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const scrap = await db.getAsync('SELECT * FROM scraps WHERE id = ?', [req.params.id]);
    if (!scrap) return res.status(404).json({ error: 'Scrap não encontrado' });
    if (scrap.author_id !== req.user.id && scrap.target_id !== req.user.id)
      return res.status(403).json({ error: 'Sem permissão' });
    await db.runAsync('DELETE FROM scraps WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
