const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const events = await db.allAsync(`
      SELECT e.*, u.username as owner_name, u.avatar as owner_avatar,
        (SELECT COUNT(*) FROM event_participants ep WHERE ep.event_id = e.id) as participant_count
      FROM events e JOIN users u ON u.id = e.owner_id ORDER BY e.date ASC
    `, []);
    const result = await Promise.all(events.map(async ev => ({
      ...ev,
      isParticipating: !!(await db.getAsync('SELECT id FROM event_participants WHERE event_id = ? AND user_id = ?', [ev.id, req.user.id]))
    })));
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const ev = await db.getAsync(`
      SELECT e.*, u.username as owner_name, u.avatar as owner_avatar,
        (SELECT COUNT(*) FROM event_participants ep WHERE ep.event_id = e.id) as participant_count
      FROM events e JOIN users u ON u.id = e.owner_id WHERE e.id = ?
    `, [req.params.id]);
    if (!ev) return res.status(404).json({ error: 'Evento não encontrado' });
    const [participants, comments, partRow] = await Promise.all([
      db.allAsync('SELECT u.id, u.username, u.avatar FROM event_participants ep JOIN users u ON u.id = ep.user_id WHERE ep.event_id = ? LIMIT 20', [req.params.id]),
      db.allAsync('SELECT ec.*, u.username as author_name, u.avatar as author_avatar FROM event_comments ec JOIN users u ON u.id = ec.author_id WHERE ec.event_id = ? ORDER BY ec.created_at ASC', [req.params.id]),
      db.getAsync('SELECT id FROM event_participants WHERE event_id = ? AND user_id = ?', [req.params.id, req.user.id]),
    ]);
    res.json({ ...ev, participants, comments, isParticipating: !!partRow });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, date, location } = req.body;
    if (!name || !date) return res.status(400).json({ error: 'Nome e data obrigatórios' });
    const id = uuidv4();
    await db.runAsync('INSERT INTO events (id, name, description, date, location, owner_id) VALUES (?, ?, ?, ?, ?, ?)', [id, name, description || '', date, location || '', req.user.id]);
    await db.runAsync('INSERT INTO event_participants (id, event_id, user_id) VALUES (?, ?, ?)', [uuidv4(), id, req.user.id]);
    res.json({ id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/participate', authMiddleware, async (req, res) => {
  try {
    const exists = await db.getAsync('SELECT id FROM event_participants WHERE event_id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (exists) {
      await db.runAsync('DELETE FROM event_participants WHERE event_id = ? AND user_id = ?', [req.params.id, req.user.id]);
      res.json({ participating: false });
    } else {
      await db.runAsync('INSERT INTO event_participants (id, event_id, user_id) VALUES (?, ?, ?)', [uuidv4(), req.params.id, req.user.id]);
      res.json({ participating: true });
    }
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const { body } = req.body;
    if (!body) return res.status(400).json({ error: 'Corpo obrigatório' });
    const cid = uuidv4();
    await db.runAsync('INSERT INTO event_comments (id, event_id, author_id, body) VALUES (?, ?, ?, ?)', [cid, req.params.id, req.user.id, body]);
    const comment = await db.getAsync('SELECT ec.*, u.username as author_name, u.avatar as author_avatar FROM event_comments ec JOIN users u ON u.id = ec.author_id WHERE ec.id = ?', [cid]);
    res.json(comment);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
