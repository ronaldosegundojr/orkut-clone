const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'tukro_secret_2026';

router.post('/register', async (req, res) => {
    try {
        const { fullName, username, email, password, secondaryEmail, birthDate, socialNetworks, city, state, country, preferences } = req.body;
        if (!fullName || !username || !email || !password) return res.status(400).json({ error: 'Campos obrigatórios faltando' });
        const existingEmail = await db.getAsync('SELECT id FROM users WHERE email = ?', [email]);
        if (existingEmail) return res.status(409).json({ error: 'Email já cadastrado' });
        const existingUsername = await db.getAsync('SELECT id FROM users WHERE username = ?', [username]);
        if (existingUsername) return res.status(409).json({ error: 'Nome de usuário já está em uso' });
        const hash = bcrypt.hashSync(password, 10);
        const id = uuidv4();
        const detailsObj = { secondaryEmail, birthDate, socialNetworks, state_or_region: state, preferences };
        const details = JSON.stringify(detailsObj);

        // Use user_common.jpg avatar as default
        await db.runAsync('INSERT INTO users (id, name, username, email, password_hash, avatar, city, country, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, fullName, username, email, hash, `/user_common.jpg`, city || '', country || '', details]);
        const token = jwt.sign({ id, email }, SECRET, { expiresIn: '7d' });
        const user = await db.getAsync('SELECT id, name, username, email, avatar, humor, bio, city, country, created_at FROM users WHERE id = ?', [id]);
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
