const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'tukro_secret_2026';

router.post('/register', async (req, res) => {
    try {
        const { fullName, username, email, password, secondaryEmail, birthDate, gender, socialNetworks, city, state, country, preferences } = req.body;
        if (!fullName || !username || !email || !password) return res.status(400).json({ error: 'Campos obrigatórios faltando' });
        const existingEmail = await db.getAsync('SELECT id FROM users WHERE email = ?', [email]);
        if (existingEmail) return res.status(409).json({ error: 'Email já cadastrado' });
        const existingUsername = await db.getAsync('SELECT id FROM users WHERE username = ?', [username]);
        if (existingUsername) return res.status(409).json({ error: 'Nome de usuário já está em uso' });
        const hash = bcrypt.hashSync(password, 10);
        const id = uuidv4();
        const detailsObj = { name: fullName, secondaryEmail, birthDate, gender, socialNetworks, state_or_region: state, preferences };
        const details = JSON.stringify(detailsObj);

        // Use user_common.jpg avatar as default
        await db.runAsync('INSERT INTO users (id, username, email, password_hash, avatar, city, country, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id, username, email, hash, `/user_common.jpg`, city || '', country || '', details]);
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

const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Helper to send email (Ethereal for free/testing)
async function sendResetEmail(email, token) {
    let testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });

    const resetLink = `http://localhost:5173/reset-password?token=${token}`;

    const info = await transporter.sendMail({
        from: '"Tukro Security" <security@tukro.com>',
        to: email,
        subject: "Recuperação de Senha - Tukro",
        text: `Olá! Você solicitou a recuperação de senha no Tukro. Clique no link para redefinir: ${resetLink}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #c9d7f1; padding: 20px;">
                <h2 style="color: #d12b8f;">Tukro</h2>
                <p>Olá!</p>
                <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Tukro</strong>.</p>
                <p>Para prosseguir, clique no botão abaixo:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #d12b8f; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">Redefinir Minha Senha</a>
                </div>
                <p style="font-size: 12px; color: #666;">Se você não solicitou isso, pode ignorar este e-mail com segurança. O link expira em 1 hora.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 11px; color: #999;">Tukro Beta - Conectando você ao passado.</p>
            </div>
        `,
    });

    console.log(`\n📧 [EMAIL ENVIADO] Link de visualização: ${nodemailer.getTestMessageUrl(info)}\n`);
}

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        // SECURITY: Prevents user enumeration by always returning the same success message
        res.json({ message: 'Se este e-mail estiver cadastrado, um link de recuperação será enviado em instantes.' });

        const user = await db.getAsync('SELECT id, reset_expires FROM users WHERE email = ?', [email]);
        if (!user) return;

        // Rate Limit check
        if (user.reset_expires) {
            const lastSent = new Date(user.reset_expires).getTime() - 3600000;
            if (Date.now() - lastSent < 120000) return; // 2 min limit
        }

        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expires = new Date(Date.now() + 3600000);

        await db.runAsync('UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?', [hashedToken, expires.toISOString(), user.id]);

        await sendResetEmail(email, rawToken);

    } catch (e) {
        console.error('Forgot password error:', e);
    }
});

router.post('/reset-password', async (req, res) => {
    try {
        const { token: rawToken, password } = req.body;
        if (!rawToken || !password) return res.status(400).json({ error: 'Dados incompletos' });

        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
        const user = await db.getAsync('SELECT id FROM users WHERE reset_token = ? AND reset_expires > ?', [hashedToken, new Date().toISOString()]);

        if (!user) return res.status(400).json({ error: 'Link de recuperação inválido ou expirado.' });

        const hash = bcrypt.hashSync(password, 10);
        await db.runAsync('UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?', [hash, user.id]);

        res.json({ message: 'Senha alterada com sucesso!' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
