const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { target_id, text } = req.body;
    if (!target_id || !text) return res.status(400).json({ error: 'target_id e text obrigatórios' });
    if (target_id === req.user.id) return res.status(400).json({ error: 'Não pode enviar depoimento para si mesmo' });
    
    const existing = await db.getAsync('SELECT id FROM testimonials WHERE author_id = ? AND target_id = ?', [req.user.id, target_id]);
    if (existing) return res.status(400).json({ error: 'Já enviou um depoimento para este usuário' });
    
    const id = uuidv4();
    await db.runAsync('INSERT INTO testimonials (id, author_id, target_id, text) VALUES (?, ?, ?, ?)', [id, req.user.id, target_id, text]);
    res.json({ id, author_id: req.user.id, target_id, text, status: 'pending' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/pending', authMiddleware, async (req, res) => {
  try {
    const testimonials = await db.allAsync(`
      SELECT t.*, u.username as author_name, u.avatar as author_avatar 
      FROM testimonials t 
      JOIN users u ON u.id = t.author_id 
      WHERE t.target_id = ? AND t.status = 'pending'
      ORDER BY t.created_at DESC
    `, [req.user.id]);
    res.json(testimonials);
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
    
    const testimonials = await db.allAsync(`
      SELECT t.*, u.username as author_name, u.avatar as author_avatar, u.username as author_username
      FROM testimonials t 
      JOIN users u ON u.id = t.author_id 
      WHERE t.target_id = ? AND t.status = 'approved'
      ORDER BY t.created_at DESC
    `, [userId]);
    res.json(testimonials);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id/approve', authMiddleware, async (req, res) => {
  try {
    const testimonial = await db.getAsync('SELECT * FROM testimonials WHERE id = ?', [req.params.id]);
    if (!testimonial) return res.status(404).json({ error: 'Depoimento não encontrado' });
    if (testimonial.target_id !== req.user.id) return res.status(403).json({ error: 'Não autorizado' });
    
    await db.runAsync('UPDATE testimonials SET status = ? WHERE id = ?', ['approved', req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id/reject', authMiddleware, async (req, res) => {
  try {
    const testimonial = await db.getAsync('SELECT * FROM testimonials WHERE id = ?', [req.params.id]);
    if (!testimonial) return res.status(404).json({ error: 'Depoimento não encontrado' });
    if (testimonial.target_id !== req.user.id) return res.status(403).json({ error: 'Não autorizado' });
    
    await db.runAsync('UPDATE testimonials SET status = ? WHERE id = ?', ['rejected', req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const testimonial = await db.getAsync('SELECT * FROM testimonials WHERE id = ?', [req.params.id]);
    if (!testimonial) return res.status(404).json({ error: 'Depoimento não encontrado' });
    if (testimonial.author_id !== req.user.id && testimonial.target_id !== req.user.id) {
      return res.status(403).json({ error: 'Não autorizado' });
    }
    
    await db.runAsync('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
