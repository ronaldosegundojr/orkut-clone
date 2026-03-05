const express = require('express');
const cors = require('cors');
const { initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/scraps', require('./routes/scraps'));
app.use('/api/friends', require('./routes/friends'));
app.use('/api/fans', require('./routes/fans'));
app.use('/api/communities', require('./routes/communities'));
app.use('/api/photos', require('./routes/photos'));
app.use('/api/events', require('./routes/events'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/updates', require('./routes/updates'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'Tukro API 🌸' }));

initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🌸 Tukro API rodando em http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Erro ao inicializar DB:', err);
    process.exit(1);
});
