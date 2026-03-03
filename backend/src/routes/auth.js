const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'tukro_secret_2026';

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) return res.status(400).json({ error: 'Campos obrigatórios faltando' });
        const existing = await db.getAsync('SELECT id FROM users WHERE email = ?', [email]);
        if (existing) return res.status(409).json({ error: 'Email já cadastrado' });
        const hash = bcrypt.hashSync(password, 10);
        const id = uuidv4();
        await db.runAsync('INSERT INTO users (id, username, email, password_hash, avatar) VALUES (?, ?, ?, ?, ?)',
            [id, username, email, hash, `https://i.pravatar.cc/150?u=${id}`]);
        const token = jwt.sign({ id, email }, SECRET, { expiresIn: '7d' });
        const user = await db.getAsync('SELECT id, username, email, avatar, humor, bio, city, country, created_at FROM users WHERE id = ?', [id]);
        res.json({ token, user });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await db.getAsync('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
        const valid = bcrypt.compareSync(password, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'Senha incorreta' });
        const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '7d' });
        const { password_hash, ...safe } = user;
        res.json({ token, user: safe });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
