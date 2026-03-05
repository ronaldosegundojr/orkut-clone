const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../tukro.db');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const DB_PATH = path.join(__dirname, '../tukro.db');
const db = new sqlite3.Database(DB_PATH);

// Promisify helpers
db.runAsync = (sql, params = []) => new Promise((res, rej) => db.run(sql, params, function (err) { err ? rej(err) : res(this); }));
db.getAsync = (sql, params = []) => new Promise((res, rej) => db.get(sql, params, (err, row) => err ? rej(err) : res(row)));
db.allAsync = (sql, params = []) => new Promise((res, rej) => db.all(sql, params, (err, rows) => err ? rej(err) : res(rows)));
db.execAsync = (sql) => new Promise((res, rej) => db.exec(sql, (err) => err ? rej(err) : res()));

async function initDB() {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      avatar TEXT DEFAULT '',
      humor TEXT DEFAULT '',
      bio TEXT DEFAULT '',
      city TEXT DEFAULT '',
      country TEXT DEFAULT '',
      relationship TEXT DEFAULT '',
      details TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS scraps (
      id TEXT PRIMARY KEY,
      author_id TEXT NOT NULL,
      target_id TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS friends (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      friend_id TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS fans (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      fan_id TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS profile_views (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL,
      viewer_id TEXT NOT NULL,
      viewed_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS communities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      image TEXT DEFAULT '',
      owner_id TEXT NOT NULL,
      category TEXT DEFAULT 'Geral',
      community_type TEXT DEFAULT 'public',
      language TEXT DEFAULT 'Português',
      city TEXT DEFAULT '',
      state TEXT DEFAULT '',
      country TEXT DEFAULT 'Brasil',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS community_members (
      id TEXT PRIMARY KEY,
      community_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT DEFAULT 'member'
    );
    CREATE TABLE IF NOT EXISTS community_requests (
      id TEXT PRIMARY KEY,
      community_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS forum_topics (
      id TEXT PRIMARY KEY,
      community_id TEXT NOT NULL,
      author_id TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS forum_comments (
      id TEXT PRIMARY KEY,
      topic_id TEXT NOT NULL,
      author_id TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS photos (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      url TEXT NOT NULL,
      caption TEXT DEFAULT '',
      album TEXT DEFAULT 'Geral',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS photo_comments (
      id TEXT PRIMARY KEY,
      photo_id TEXT NOT NULL,
      author_id TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS photo_tags (
      id TEXT PRIMARY KEY,
      photo_id TEXT NOT NULL,
      user_id TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      date TEXT NOT NULL,
      location TEXT DEFAULT '',
      owner_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS event_participants (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      user_id TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS event_comments (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      author_id TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS videos (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      url TEXT NOT NULL,
      title TEXT NOT NULL,
      views INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS video_comments (
      id TEXT PRIMARY KEY,
      video_id TEXT NOT NULL,
      author_id TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      sender_id TEXT NOT NULL,
      receiver_id TEXT NOT NULL,
      body TEXT NOT NULL,
      type TEXT DEFAULT 'text',
      read INTEGER DEFAULT 0,
      deleted_by_sender INTEGER DEFAULT 0,
      deleted_by_receiver INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS testimonials (
      id TEXT PRIMARY KEY,
      author_id TEXT NOT NULL,
      target_id TEXT NOT NULL,
      text TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS user_votes (
      id TEXT PRIMARY KEY,
      voter_id TEXT NOT NULL,
      target_id TEXT NOT NULL,
      type TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(voter_id, target_id, type)
    );
  `);

  await seedData();
}

async function seedData() {
  const count = await db.getAsync('SELECT COUNT(*) as c FROM users');
  if (count.c > 0) return;

  const avatars = [
    'https://i.pravatar.cc/150?img=1',
    'https://i.pravatar.cc/150?img=2',
    'https://i.pravatar.cc/150?img=3',
    'https://i.pravatar.cc/150?img=4',
    'https://i.pravatar.cc/150?img=5',
    'https://i.pravatar.cc/150?img=6',
    'https://i.pravatar.cc/150?img=7',
    'https://i.pravatar.cc/150?img=8',
    'https://i.pravatar.cc/150?img=9',
    'https://i.pravatar.cc/150?img=10',
    'https://i.pravatar.cc/150?img=11',
    'https://i.pravatar.cc/150?img=12',
  ];

  const users = [
    { id: uuidv4(), username: 'Demo User', email: 'demo@tukro.com', password: '123456', avatar: avatars[0], humor: 'Curtindo o Tukro! 🌟', bio: 'Oi! Sou o usuário demo. Adoro música, filmes e tecnologia.', city: 'São Paulo', country: 'Brasil', details: { birthday: '15 de Janeiro', languages: 'Português, Inglês', here_for: 'Fazer amigos', children: 'Não', ethnicity: 'Latino', religion: 'Católico', fashion: 'Casual', smoking: 'Não', drinking: 'Socialmente', pets: 'Cachorros', living: 'Sozinho', hometown: 'São Paulo, SP', passions: 'Tecnologia, Música, Games', sports: 'Futebol, Natação', activities: 'Séries, Filmes, Games', books: 'Ficção Científica', music: 'Rock, Pop, MPB', tv_shows: 'Friends, Breaking Bad', movies: 'De Volta para o Futuro', cuisines: 'Italiana, Japonesa', state_or_region: 'São Paulo', zip_code: '01000' } },
    { id: uuidv4(), username: 'Ana Carolina', email: 'ana@tukro.com', password: '123456', avatar: avatars[1], humor: 'Feliz e sorrindo 😊', bio: 'Amante de fotografia e viagens! Adoro capturar momentos especiais.', city: 'Rio de Janeiro', country: 'Brasil', details: { birthday: '22 de Março', languages: 'Português, Inglês, Espanhol', here_for: 'Fazer amigos', children: 'Não', ethnicity: 'Latino', religion: 'Espírita', fashion: 'Bohemia', smoking: 'Não', drinking: 'Socialmente', pets: 'Gatos', living: 'Com a família', hometown: 'Rio de Janeiro, RJ', passions: 'Fotografia, Viagens, Arte', sports: 'Yoga, Natação', activities: 'Fotografia, Cinema', books: 'Romance, Poesia', music: 'MPB, Samba, Jazz', tv_shows: 'Novelas, Documentários', movies: 'Casablanca, Titanic', cuisines: 'Brasileira, Italiana', state_or_region: 'Rio de Janeiro', zip_code: '20000' } },
    { id: uuidv4(), username: 'Carlos Eduardo', email: 'carlos@tukro.com', password: '123456', avatar: avatars[2], humor: 'Codando com café ☕', bio: 'Dev apaixonado por tecnologia e código aberto.', city: 'Belo Horizonte', country: 'Brasil', details: { birthday: '10 de Maio', languages: 'Português, Inglês', here_for: 'Networking', children: 'Não', ethnicity: 'Latino', religion: 'Agnóstico', fashion: 'Casual', smoking: 'Não', drinking: 'Socialmente', pets: 'Cachorros', living: 'Sozinho', hometown: 'Belo Horizonte, MG', passions: 'Programação, Tecnologia, Café', sports: 'Futebol', activities: 'Coding, Games', books: 'Tech, Ficção', music: 'Rock, Metal', tv_shows: 'Silicon Valley', movies: 'Matrix, Inception', cuisines: 'Brasileira', state_or_region: 'Minas Gerais', zip_code: '30000' } },
    { id: uuidv4(), username: 'Juliana Oliveira', email: 'juliana@tukro.com', password: '123456', avatar: avatars[3], humor: 'Vivendo cada momento 💫', bio: 'Amo dançar, cozinhar e estar com os amigos! Vida é curta, aproveite!', city: 'Curitiba', country: 'Brasil', details: { birthday: '8 de Junho', languages: 'Português, Inglês', here_for: 'Fazer amigos', children: 'Não', ethnicity: 'Latino', religion: 'Católica', fashion: 'Elegante', smoking: 'Não', drinking: 'Socialmente', pets: 'Cachorros', living: 'Com a família', hometown: 'Curitiba, PR', passions: 'Dança, Cozinha, Fotografia', sports: 'Dança, Academia', activities: 'Dançar, Cozinhar', books: 'Romance, Autoajuda', music: 'Pop, K-Pop, Funk', tv_shows: 'A Casa dos Espíritos', movies: 'Comédia Romântica', cuisines: 'Japonesa, Italiana', state_or_region: 'Paraná', zip_code: '80000' } },
    { id: uuidv4(), username: 'Bruno Henrique', email: 'bruno@tukro.com', password: '123456', avatar: avatars[4], humor: 'Games e mais games 🎮', bio: 'Gamer nas horas vagas. Fã de animes e cultura japonesa!', city: 'Porto Alegre', country: 'Brasil', details: { birthday: '18 de Agosto', languages: 'Português, Inglês, Japonês', here_for: 'Fazer amigos', children: 'Não', ethnicity: 'Latino', religion: 'Ateu', fashion: 'Casual Gamer', smoking: 'Não', drinking: 'Socialmente', pets: 'Gatos', living: 'Com a família', hometown: 'Porto Alegre, RS', passions: 'Games, Animes, Mangás', sports: 'E-Sports', activities: 'Gaming, Animes', books: 'Mangás, Light Novels', music: 'J-Pop, Rock Japonês', tv_shows: 'Anime, Séries', movies: 'Animes, Ação', cuisines: 'Japonesa, Coreana', state_or_region: 'Rio Grande do Sul', zip_code: '90000' } },
    { id: uuidv4(), username: 'Mariana Santos', email: 'mariana@tukro.com', password: '123456', avatar: avatars[5], humor: 'Estudante de Medicina 🩺', bio: 'Future doctor! Amo música classical e piano.', city: 'São Paulo', country: 'Brasil', details: { birthday: '5 de Abril', languages: 'Português, Inglês, Alemão', here_for: 'Fazer amigos', children: 'Não', ethnicity: 'Latino', religion: 'Católica', fashion: 'Clássica', smoking: 'Não', drinking: 'Raramente', pets: 'Cachorros', living: 'Com a família', hometown: 'São Paulo, SP', passions: 'Medicina, Música, Leitura', sports: 'Natação, Corrida', activities: 'Estudar, Piano', books: 'Didáticos, Romance', music: 'Clássica, MPB', tv_shows: 'Documentários', movies: 'Drama, Documentário', cuisines: 'Francesa, Italiana', state_or_region: 'São Paulo', zip_code: '01100' } },
    { id: uuidv4(), username: 'Rafael Costa', email: 'rafael@tukro.com', password: '123456', avatar: avatars[6], humor: 'Amo música e surf! 🌊', bio: 'Músico nas horas vagas. Apaixonado pelo mar e surf.', city: 'Santos', country: 'Brasil', details: { birthday: '12 de Janeiro', languages: 'Português, Inglês, Espanhol', here_for: 'Fazer amigos', children: 'Não', ethnicity: 'Latino', religion: 'Espírita', fashion: 'Praia', smoking: 'Não', drinking: 'Socialmente', pets: 'Cachorros', living: 'Sozinho', hometown: 'Santos, SP', passions: 'Música, Surf, Mar', sports: 'Surf, Futevôlei', activities: 'Tocar violão, Surf', books: 'Poesia, Romance', music: 'Reggae, Rock, MPB', tv_shows: 'Esportes', movies: 'Surf, Aventura', cuisines: 'Brasileira, Japonesa', state_or_region: 'São Paulo', zip_code: '11000' } },
    { id: uuidv4(), username: 'Camila Ferreira', email: 'camila@tukro.com', password: '123456', avatar: avatars[7], humor: 'Chef de cozinha 👩‍🍳', bio: 'Adoro cozinhar e experimentar receitas novas! foodie assumida.', city: 'São Paulo', country: 'Brasil', details: { birthday: '25 de Novembro', languages: 'Português, Inglês, Francês', here_for: 'Fazer amigos', children: 'Não', ethnicity: 'Latino', religion: 'Católica', fashion: 'Elegante', smoking: 'Não', drinking: 'Socialmente', pets: 'Gatos', living: 'Sozinho', hometown: 'São Paulo, SP', passions: 'Culinária, Vinho, Viagens', sports: 'Pilates, Caminhada', activities: 'Cozinhar, Degustar', books: 'Livros de Culinária', music: 'MPB, Bossa Nova', tv_shows: 'MasterChef, Novelas', movies: 'Comédia, Romance', cuisines: 'Francesa, Italiana, Japonesa', state_or_region: 'São Paulo', zip_code: '01200' } },
    { id: uuidv4(), username: 'Pedro Álvares', email: 'pedro@tukro.com', password: '123456', avatar: avatars[8], humor: 'Futebol é vida ⚽', bio: 'Torcedor fanático! Amo futebol e pets.', city: 'Rio de Janeiro', country: 'Brasil', details: { birthday: '3 de Fevereiro', languages: 'Português', here_for: 'Fazer amigos', children: 'Não', ethnicity: 'Latino', religion: 'Católico', fashion: 'Casual', smoking: 'Não', drinking: 'Socialmente', pets: 'Cachorros', living: 'Com a família', hometown: 'Rio de Janeiro, RJ', passions: 'Futebol, Pets, Família', sports: 'Futebol, Corrida', activities: 'Futebol, Pets', books: 'Biografia', music: 'Samba, Funk, Pop', tv_shows: 'Futebol, Novelas', movies: 'Futebol, Comédia', cuisines: 'Brasileira', state_or_region: 'Rio de Janeiro', zip_code: '20000' } },
    { id: uuidv4(), username: 'Luísa Rodrigues', email: 'luisa@tukro.com', password: '123456', avatar: avatars[9], humor: 'Artesã e criativa 🎨', bio: 'Amo artesanato, pintura e tudo que é handmade!', city: 'Recife', country: 'Brasil', details: { birthday: '17 de Outubro', languages: 'Português, Inglês, Italiano', here_for: 'Fazer amigos', children: 'Não', ethnicity: 'Latino', religion: 'Católica', fashion: 'Artesanal', smoking: 'Não', drinking: 'Socialmente', pets: 'Gatos', living: 'Com a família', hometown: 'Recife, PE', passions: 'Artesanato, Pintura, Diseño', sports: 'Nenhuma', activities: 'Pintar, Costurar', books: 'Arte, Romance', music: 'MPB, Bossa Nova', tv_shows: 'Arte, Documentários', movies: 'Arte, Drama', cuisines: 'Nordestina, Italiana', state_or_region: 'Pernambuco', zip_code: '50000' } },
    { id: uuidv4(), username: 'Thiago Martins', email: 'thiago@tukro.com', password: '123456', avatar: avatars[10], humor: 'Ciclista e aventureiro 🚴', bio: 'Amo pedalar, trilhas e natureza! Vivo em movimento.', city: 'Florianópolis', country: 'Brasil', details: { birthday: '30 de Julho', languages: 'Português, Inglês, Espanhol', here_for: 'Fazer amigos', children: 'Não', ethnicity: 'Latino', religion: 'Agnóstico', fashion: 'Esporte', smoking: 'Não', drinking: 'Raramente', pets: 'Cachorros', living: 'Sozinho', hometown: 'Florianópolis, SC', passions: 'Ciclismo, Trilhas, Natureza', sports: 'Ciclismo, Corrida', activities: 'Pedalar, Trilhar', books: 'Aventura, Biografia', music: 'Rock, Reggae', tv_shows: 'Esportes, Documentários', movies: 'Aventura, Ação', cuisines: 'Saludável, Japonesa', state_or_region: 'Santa Catarina', zip_code: '88000' } },
    { id: uuidv4(), username: 'Bianca Lima', email: 'bianca@tukro.com', password: '123456', avatar: avatars[11], humor: 'Pets são minha vida 🐾', bio: 'Amante de animais! Tenho 3 dogs e 2 cats. Adoto sempre!', city: 'Brasília', country: 'Brasil', details: { birthday: '14 de Fevereiro', languages: 'Português, Inglês', here_for: 'Fazer amigos', children: 'Não', ethnicity: 'Latino', religion: 'Católica', fashion: 'Casual', smoking: 'Não', drinking: 'Socialmente', pets: 'Cachorros, Gatos', living: 'Com a família', hometown: 'Brasília, DF', passions: 'Pets, Animais, Natureza', sports: 'Yoga, Caminhada', activities: 'Cuidar pets, Adotar', books: 'Pets, Autoajuda', music: 'Pop, MPB', tv_shows: 'Animais, Novelas', movies: 'Animais, Família', cuisines: 'Brasileira, Italiana', state_or_region: 'Distrito Federal', zip_code: '70000' } },
  ];

  for (const u of users) {
    const hash = bcrypt.hashSync(u.password, 10);
    const mockDetails = JSON.stringify(u.details || {});
    await db.runAsync('INSERT INTO users (id, username, email, password_hash, avatar, humor, bio, city, country, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [u.id, u.username, u.email, hash, u.avatar, u.humor, u.bio, u.city, u.country, mockDetails]);
  }

  const [demo, ana, carlos, juliana, bruno, mariana, rafael, camila, pedro, luisa, thiago, bianca] = users;

  // Friends - demo é amigo de todos
  const friendPairs = [
    [demo.id, ana.id], [ana.id, demo.id],
    [demo.id, carlos.id], [carlos.id, demo.id],
    [demo.id, juliana.id], [juliana.id, demo.id],
    [demo.id, bruno.id], [bruno.id, demo.id],
    [demo.id, mariana.id], [mariana.id, demo.id],
    [demo.id, rafael.id], [rafael.id, demo.id],
    [demo.id, camila.id], [camila.id, demo.id],
    [demo.id, pedro.id], [pedro.id, demo.id],
    [demo.id, luisa.id], [luisa.id, demo.id],
    [demo.id, thiago.id], [thiago.id, demo.id],
    [demo.id, bianca.id], [bianca.id, demo.id],
    // outros amigos entre si
    [ana.id, carlos.id], [carlos.id, ana.id],
    [juliana.id, mariana.id], [mariana.id, juliana.id],
    [bruno.id, rafael.id], [rafael.id, bruno.id],
    [camila.id, luisa.id], [luisa.id, camila.id],
    [pedro.id, thiago.id], [thiago.id, pedro.id],
  ];
  for (const [a, b] of friendPairs) {
    await db.runAsync('INSERT INTO friends (id, user_id, friend_id, status) VALUES (?, ?, ?, "accepted")', [uuidv4(), a, b]);
  }

  // Fans
  await db.runAsync('INSERT INTO fans (id, user_id, fan_id) VALUES (?, ?, ?)', [uuidv4(), demo.id, ana.id]);
  await db.runAsync('INSERT INTO fans (id, user_id, fan_id) VALUES (?, ?, ?)', [uuidv4(), demo.id, carlos.id]);
  await db.runAsync('INSERT INTO fans (id, user_id, fan_id) VALUES (?, ?, ?)', [uuidv4(), demo.id, juliana.id]);
  await db.runAsync('INSERT INTO fans (id, user_id, fan_id) VALUES (?, ?, ?)', [uuidv4(), demo.id, mariana.id]);

  // Scraps
  const scraps = [
    [ana.id, demo.id, 'Oi Demo! Bem-vindo ao Tukro! Que ótimo ter você por aqui! 🎉'],
    [carlos.id, demo.id, 'E aí cara! Tukro é demais né? Nostalgia pura! 😄'],
    [juliana.id, demo.id, 'Olá! Vi seu perfil e adorei! Podemos ser amigos? 🌸'],
    [bruno.id, demo.id, 'Fala meu! Gamer também? Bora jogar juntos! 🎮'],
    [mariana.id, demo.id, 'Oi! Vi que você curte tecnologia. Sou estudante de medicina! 🩺'],
    [rafael.id, demo.id, 'E aí brother! Adorei seu perfil. Surf e música! 🌊'],
    [camila.id, demo.id, 'Olá! Adorei suas fotos. Sou chef, adoraria trocar receitas! 👩‍🍳'],
    [pedro.id, demo.id, 'Beleza! Time do coração? Vou no Flu, e você? ⚽'],
    [luisa.id, demo.id, 'Oi! Vi que você curte arte. Sou artesã, adorei seu perfil! 🎨'],
    [thiago.id, demo.id, 'Fala! Adoro natureza. Bora fazer uma trilha? 🚴'],
    [bianca.id, demo.id, 'Oi! Vi que você ama pets. Tenho 3 dogs e 2 cats! 🐾'],
    [demo.id, ana.id, 'Ana! Obrigado pelo scrap! Adorei suas fotos de viagem! 🙌'],
    [demo.id, carlos.id, 'Carlos! Bora codar juntos! Sou dev também! 💻'],
    [demo.id, juliana.id, 'Juliana! Adorei sua energia! Vamos dançar? 💃'],
    [demo.id, bruno.id, 'Bruno! Qual jogo você está jogando agora? 🎮'],
    [demo.id, mariana.id, 'Mariana! Medicina é_TOP! Sucesso na carreira! 🩺'],
    [demo.id, rafael.id, 'Rafael! Adorei suas fotos de surf! Onde você surfa? 🌊'],
    [demo.id, camila.id, 'Camila! Adoro cozinhar. Qual sua receita favorita? 👨‍🍳'],
    [demo.id, pedro.id, 'Pedro! Torço para o Flamengo! E você? ⚽'],
    [demo.id, luisa.id, 'Luísa! Adorei seu artesanato. Muito bonito! 🎨'],
  ];
  for (const [a, t, text] of scraps) {
    await db.runAsync('INSERT INTO scraps (id, author_id, target_id, text) VALUES (?, ?, ?, ?)', [uuidv4(), a, t, text]);
  }

  // Profile views
  const views = [
    [demo.id, ana.id, new Date(Date.now() - 1000 * 60 * 5).toISOString()],
    [demo.id, carlos.id, new Date(Date.now() - 1000 * 60 * 30).toISOString()],
    [demo.id, juliana.id, new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()],
    [demo.id, bruno.id, new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()],
  ];
  for (const [pid, vid, time] of views) {
    await db.runAsync('INSERT INTO profile_views (id, profile_id, viewer_id, viewed_at) VALUES (?, ?, ?, ?)', [uuidv4(), pid, vid, time]);
  }

  // Communities - 15 comunidades incluindo as principais
  const c1id = uuidv4(); // Eu odeio acordar cedo - PRINCIPAL
  const c2id = uuidv4(); // TheRebelz.biz - PRINCIPAL
  const c3id = uuidv4();
  const c4id = uuidv4();
  const c5id = uuidv4();
  const c6id = uuidv4();
  const c7id = uuidv4();
  const c8id = uuidv4();
  const c9id = uuidv4();
  const c10id = uuidv4();
  const c11id = uuidv4();
  const c12id = uuidv4();
  const c13id = uuidv4();
  const c14id = uuidv4();
  const c15id = uuidv4();

  await db.runAsync('INSERT INTO communities (id, name, description, image, owner_id, category, community_type, language, city, state, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [c1id, 'Eu odeio acordar cedo', 'Para quem ama a cama mais do que qualquer coisa! Odeio acordar cedo - grupo oficial. Aquele que dislikes acorda antes das 10h 😴', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_ysMq58ofyrdFWqBcdfOdgqwaxqSM0MNhtg&s', demo.id, 'Humor', 'public', 'Português', 'São Paulo', 'SP', 'Brasil']);
  await db.runAsync('INSERT INTO communities (id, name, description, image, owner_id, category, community_type, language, city, state, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [c2id, 'TheRebelz.Biz', 'A comunidade mais BR de todas! Aqui é rebelde com causa e sem causa! 💀🔥', 'https://pbs.twimg.com/profile_images/592412740976824322/P1S_1TKh_400x400.png', carlos.id, 'Humor', 'public', 'Português', 'Belo Horizonte', 'MG', 'Brasil']);
  await db.runAsync('INSERT INTO communities (id, name, description, image, owner_id, category, community_type, language, city, state, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [c3id, 'Fãs do Tukro', 'Comunidade oficial dos fãs do Tukro!', 'https://i.pravatar.cc/150?img=10', demo.id, 'Tecnologia', 'public', 'Português', 'São Paulo', 'SP', 'Brasil']);
  await db.runAsync('INSERT INTO communities (id, name, description, image, owner_id, category, community_type, language, city, state, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [c4id, 'Amantes de Música Brasileira', 'Para quem ama MPB, samba, forró e axé!', 'https://i.pravatar.cc/150?img=11', ana.id, 'Música', 'public', 'Português', 'Rio de Janeiro', 'RJ', 'Brasil']);
  await db.runAsync('INSERT INTO communities (id, name, description, image, owner_id, category, community_type, language, city, state, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [c5id, 'Gamers do Brasil 🎮', 'A maior comunidade de gamers do Tukro!', 'https://i.pravatar.cc/150?img=12', bruno.id, 'Games', 'public', 'Português', 'Porto Alegre', 'RS', 'Brasil']);
  await db.runAsync('INSERT INTO communities (id, name, description, image, owner_id, category, community_type, language, city, state, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [c6id, 'Animes e Mangás 🏯', 'Para os otaku de plantão! Naruto, One Piece, Attack on Titan e mais!', 'https://i.pravatar.cc/150?img=15', bruno.id, 'Entretenimento', 'public', 'Português', 'Porto Alegre', 'RS', 'Brasil']);
  await db.runAsync('INSERT INTO communities (id, name, description, image, owner_id, category, community_type, language, city, state, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [c7id, 'Fotografia & Viagens 📸', 'Compartilhe suas fotos e descubra novos lugares!', 'https://i.pravatar.cc/150?img=20', ana.id, 'Arte', 'public', 'Português', 'Rio de Janeiro', 'RJ', 'Brasil']);
  await db.runAsync('INSERT INTO communities (id, name, description, image, owner_id, category, community_type, language, city, state, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [c8id, 'Culinária e Food 🔪', 'Receitas, dicas de cozinha e tudo sobre gastronomia!', 'https://i.pravatar.cc/150?img=25', camila.id, 'Estilo de Vida', 'public', 'Português', 'São Paulo', 'SP', 'Brasil']);
  await db.runAsync('INSERT INTO communities (id, name, description, image, owner_id, category, community_type, language, city, state, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [c9id, 'Pet Lovers 🐾', 'Amo animais! Cachorros, gatos, pássaros - todos são bem-vindos!', 'https://i.pravatar.cc/150?img=30', bianca.id, 'Estilo de Vida', 'public', 'Português', 'Brasília', 'DF', 'Brasil']);
  await db.runAsync('INSERT INTO communities (id, name, description, image, owner_id, category, community_type, language, city, state, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [c10id, 'Futebol Brasileiro ⚽', 'Para os apaixonados pelo esporte rei! Times, jogadores e mais!', 'https://i.pravatar.cc/150?img=35', pedro.id, 'Esportes', 'public', 'Português', 'Rio de Janeiro', 'RJ', 'Brasil']);
  await db.runAsync('INSERT INTO communities (id, name, description, image, owner_id, category, community_type, language, city, state, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [c11id, 'Artesanato & DIY 🎨', 'Feito à mão! Compartilhe suas criações e artesanatos!', 'https://i.pravatar.cc/150?img=40', luisa.id, 'Arte', 'public', 'Português', 'Recife', 'PE', 'Brasil']);
  await db.runAsync('INSERT INTO communities (id, name, description, image, owner_id, category, community_type, language, city, state, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [c12id, 'Ciclistas & Aventureiros 🚴', 'Pedal, trilhas e natureza! Para quem ama o ar livre!', 'https://i.pravatar.cc/150?img=45', thiago.id, 'Esportes', 'public', 'Português', 'Florianópolis', 'SC', 'Brasil']);
  await db.runAsync('INSERT INTO communities (id, name, description, image, owner_id, category, community_type, language, city, state, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [c13id, 'Surf & Praia 🌊', 'Ondas, mar e sol! Para os amantes do mar!', 'https://i.pravatar.cc/150?img=50', rafael.id, 'Esportes', 'public', 'Português', 'Santos', 'SP', 'Brasil']);
  await db.runAsync('INSERT INTO communities (id, name, description, image, owner_id, category, community_type, language, city, state, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [c14id, 'Desenvolvedores 💻', 'Programação, código e tecnologia!', 'https://i.pravatar.cc/150?img=55', carlos.id, 'Tecnologia', 'public', 'Português', 'Belo Horizonte', 'MG', 'Brasil']);
  await db.runAsync('INSERT INTO communities (id, name, description, image, owner_id, category, community_type, language, city, state, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [c15id, 'Netfriends & Comunidades', 'Para quem quer fazer muitos amigos!', 'https://i.pravatar.cc/150?img=60', demo.id, 'Comunidades', 'public', 'Português', 'São Paulo', 'SP', 'Brasil']);

  // Todos são membros das comunidades principais (owner como admin)
  const memberships = [
    [c1id, demo.id, 'admin'], [c1id, ana.id, 'member'], [c1id, carlos.id, 'moderator'], [c1id, juliana.id, 'member'], [c1id, bruno.id, 'member'], [c1id, mariana.id, 'member'], [c1id, rafael.id, 'member'], [c1id, camila.id, 'member'], [c1id, pedro.id, 'member'], [c1id, luisa.id, 'member'], [c1id, thiago.id, 'member'], [c1id, bianca.id, 'member'],
    [c2id, demo.id, 'member'], [c2id, carlos.id, 'admin'], [c2id, bruno.id, 'moderator'], [c2id, rafael.id, 'member'], [c2id, pedro.id, 'member'], [c2id, thiago.id, 'member'],
    [c3id, demo.id, 'admin'], [c3id, ana.id, 'member'], [c3id, carlos.id, 'member'], [c3id, mariana.id, 'member'], [c3id, thiago.id, 'member'],
    [c4id, ana.id, 'admin'], [c4id, juliana.id, 'member'], [c4id, demo.id, 'member'], [c4id, rafael.id, 'member'], [c4id, camila.id, 'member'],
    [c5id, bruno.id, 'admin'], [c5id, carlos.id, 'member'], [c5id, demo.id, 'member'], [c5id, rafael.id, 'member'], [c5id, pedro.id, 'member'],
    [c6id, bruno.id, 'admin'], [c6id, mariana.id, 'member'], [c6id, rafael.id, 'member'], [c6id, demo.id, 'member'],
    [c7id, ana.id, 'admin'], [c7id, juliana.id, 'member'], [c7id, camila.id, 'member'], [c7id, luisa.id, 'member'], [c7id, demo.id, 'member'],
    [c8id, camila.id, 'admin'], [c8id, ana.id, 'member'], [c8id, juliana.id, 'member'], [c8id, demo.id, 'member'], [c8id, luisa.id, 'member'],
    [c9id, bianca.id, 'admin'], [c9id, juliana.id, 'member'], [c9id, camila.id, 'member'], [c9id, demo.id, 'member'], [c9id, mariana.id, 'member'],
    [c10id, pedro.id, 'admin'], [c10id, demo.id, 'member'], [c10id, rafael.id, 'member'], [c10id, thiago.id, 'member'], [c10id, carlos.id, 'member'],
    [c11id, luisa.id, 'admin'], [c11id, camila.id, 'member'], [c11id, ana.id, 'member'], [c11id, demo.id, 'member'], [c11id, mariana.id, 'member'],
    [c12id, thiago.id, 'admin'], [c12id, rafael.id, 'member'], [c12id, demo.id, 'member'], [c12id, pedro.id, 'member'], [c12id, bruno.id, 'member'],
    [c13id, rafael.id, 'admin'], [c13id, thiago.id, 'member'], [c13id, demo.id, 'member'], [c13id, juliana.id, 'member'], [c13id, ana.id, 'member'],
    [c14id, carlos.id, 'admin'], [c14id, bruno.id, 'member'], [c14id, demo.id, 'member'], [c14id, mariana.id, 'member'], [c14id, thiago.id, 'member'],
    [c15id, demo.id, 'admin'], [c15id, ana.id, 'member'], [c15id, juliana.id, 'member'], [c15id, mariana.id, 'member'], [c15id, bianca.id, 'member'],
  ];
  for (const [cid, uid, role] of memberships) {
    await db.runAsync('INSERT INTO community_members (id, community_id, user_id, role) VALUES (?, ?, ?, ?)', [uuidv4(), cid, uid, role]);
  }

  const t1id = uuidv4(), t2id = uuidv4();
  await db.runAsync('INSERT INTO forum_topics (id, community_id, author_id, title, body) VALUES (?, ?, ?, ?, ?)',
    [t1id, c1id, demo.id, 'Bem-vindos ao Tukro!', 'Pessoal, que saudade do Orkut né? O Tukro veio para trazer essa nostalgia de volta!']);
  await db.runAsync('INSERT INTO forum_topics (id, community_id, author_id, title, body) VALUES (?, ?, ?, ?, ?)',
    [t2id, c3id, bruno.id, 'Qual o melhor jogo de 2025?', 'Galera, qual foi o melhor lançamento do ano?']);
  await db.runAsync('INSERT INTO forum_comments (id, topic_id, author_id, body) VALUES (?, ?, ?, ?)',
    [uuidv4(), t1id, ana.id, 'Ai que saudade do Orkut! Adoro o Tukro! 💕']);
  await db.runAsync('INSERT INTO forum_comments (id, topic_id, author_id, body) VALUES (?, ?, ?, ?)',
    [uuidv4(), t1id, carlos.id, 'Melhor iniciativa do ano! Tukro forever! 🚀']);
  await db.runAsync('INSERT INTO forum_comments (id, topic_id, author_id, body) VALUES (?, ?, ?, ?)',
    [uuidv4(), t2id, carlos.id, 'Incrível esse ano para os games!']);

  // Photos - mais fotos de todos os usuários
  const p1id = uuidv4(), p2id = uuidv4(), p3id = uuidv4();
  await db.runAsync('INSERT INTO photos (id, owner_id, url, caption, album) VALUES (?, ?, ?, ?, ?)',
    [p1id, demo.id, 'https://picsum.photos/seed/tukro1/400/300', 'Minha primeira foto no Tukro! 📸', 'Geral']);
  await db.runAsync('INSERT INTO photos (id, owner_id, url, caption, album) VALUES (?, ?, ?, ?, ?)',
    [p2id, demo.id, 'https://picsum.photos/seed/tukro2/400/300', 'Viagem incrível!', 'Viagens']);
  await db.runAsync('INSERT INTO photos (id, owner_id, url, caption, album) VALUES (?, ?, ?, ?, ?)',
    [p3id, demo.id, 'https://picsum.photos/seed/tukro3/400/300', 'Com os amigos!', 'Amigos']);

  // Fotos da Ana
  const ana1 = uuidv4();
  await db.runAsync('INSERT INTO photos (id, owner_id, url, caption, album) VALUES (?, ?, ?, ?, ?)',
    [ana1, ana.id, 'https://picsum.photos/seed/ana1/400/300', 'Uma tarde especial 🌸', 'Geral']);
  await db.runAsync('INSERT INTO photos (id, owner_id, url, caption, album) VALUES (?, ?, ?, ?, ?)',
    [uuidv4(), ana.id, 'https://picsum.photos/seed/ana2/400/300', 'Pôr do sol no Rio 🌅', 'Viagens']);

  // Fotos do Carlos
  await db.runAsync('INSERT INTO photos (id, owner_id, url, caption, album) VALUES (?, ?, ?, ?, ?)',
    [uuidv4(), carlos.id, 'https://picsum.photos/seed/carlos1/400/300', 'Setup de desenvolvedor 💻', 'Geral']);
  await db.runAsync('INSERT INTO photos (id, owner_id, url, caption, album) VALUES (?, ?, ?, ?, ?)',
    [uuidv4(), carlos.id, 'https://picsum.photos/seed/carlos2/400/300', 'Hackathon time! 🚀', 'Trabalho']);

  // Fotos da Juliana
  await db.runAsync('INSERT INTO photos (id, owner_id, url, caption, album) VALUES (?, ?, ?, ?, ?)',
    [uuidv4(), juliana.id, 'https://picsum.photos/seed/juliana1/400/300', 'Dançando! 💃', 'Geral']);
  await db.runAsync('INSERT INTO photos (id, owner_id, url, caption, album) VALUES (?, ?, ?, ?, ?)',
    [uuidv4(), juliana.id, 'https://picsum.photos/seed/juliana2/400/300', 'Receita nova! 🍕', 'Culinária']);

  // Fotos do Bruno
  await db.runAsync('INSERT INTO photos (id, owner_id, url, caption, album) VALUES (?, ?, ?, ?, ?)',
    [uuidv4(), bruno.id, 'https://picsum.photos/seed/bruno1/400/300', 'Gaming mode ON 🎮', 'Games']);
  await db.runAsync('INSERT INTO photos (id, owner_id, url, caption, album) VALUES (?, ?, ?, ?, ?)',
    [uuidv4(), bruno.id, 'https://picsum.photos/seed/bruno2/400/300', 'Anime marathon! 🏯', 'Animes']);

  // Fotos da Mariana
  await db.runAsync('INSERT INTO photos (id, owner_id, url, caption, album) VALUES (?, ?, ?, ?, ?)',
    [uuidv4(), mariana.id, 'https://picsum.photos/seed/mariana1/400/300', 'Studying medicine 🩺', 'Estudos']);
  await db.runAsync('INSERT INTO photos (id, owner_id, url, caption, album) VALUES (?, ?, ?, ?, ?)',
    [uuidv4(), mariana.id, 'https://picsum.photos/seed/mariana2/400/300', 'Piano time 🎹', 'Música']);

  // Fotos do Rafael
  await db.runAsync('INSERT INTO photos (id, owner_id, url, caption, album) VALUES (?, ?, ?, ?, ?)',
    [uuidv4(), rafael.id, 'https://picsum.photos/seed/rafael1/400/300', 'Ondas perfeitas! 🌊', 'Surf']);
  await db.runAsync('INSERT INTO photos (id, owner_id, url, caption, album) VALUES (?, ?, ?, ?, ?)',
    [uuidv4(), rafael.id, 'https://picsum.photos/seed/rafael2/400/300', 'Violão na praia 🎸', 'Música']);

  // Fotos da Camila
  await db.runAsync('INSERT INTO photos (id, owner_id, url, caption, album) VALUES (?, ?, ?, ?, ?)',
    [uuidv4(), camila.id, 'https://picsum.photos/seed/camila1/400/300', 'Cozinhando! 👩‍🍳', 'Culinária']);
  await db.runAsync('INSERT INTO photos (id, owner_id, url, caption, album) VALUES (?, ?, ?, ?, ?)',
    [uuidv4(), camila.id, 'https://picsum.photos/seed/camila2/400/300', 'Prato do dia 🍝', 'Culinária']);

  // Fotos do Pedro
  await db.runAsync('INSERT INTO photos (id, owner_id, url, caption, album) VALUES (?, ?, ?, ?, ?)',
    [uuidv4(), pedro.id, 'https://picsum.photos/seed/pedro1/400/300', 'Jogo no Maracanã! ⚽', 'Futebol']);
  await db.runAsync('INSERT INTO photos (id, owner_id, url, caption, album) VALUES (?, ?, ?, ?, ?)',
    [uuidv4(), pedro.id, 'https://picsum.photos/seed/pedro2/400/300', 'Com a galera! 🏆', 'Geral']);

  // Fotos da Luisa
  await db.runAsync('INSERT INTO photos (id, owner_id, url, caption, album) VALUES (?, ?, ?, ?, ?)',
    [uuidv4(), luisa.id, 'https://picsum.photos/seed/luisa1/400/300', 'Minha arte! 🎨', 'Artesanato']);
  await db.runAsync('INSERT INTO photos (id, owner_id, url, caption, album) VALUES (?, ?, ?, ?, ?)',
    [uuidv4(), luisa.id, 'https://picsum.photos/seed/luisa2/400/300', 'Pintando com as mãos! 🖌️', 'Arte']);

  // Fotos do Thiago
  await db.runAsync('INSERT INTO photos (id, owner_id, url, caption, album) VALUES (?, ?, ?, ?, ?)',
    [uuidv4(), thiago.id, 'https://picsum.photos/seed/thiago1/400/300', 'Trilha na montanha! 🥾', 'Aventura']);
  await db.runAsync('INSERT INTO photos (id, owner_id, url, caption, album) VALUES (?, ?, ?, ?, ?)',
    [uuidv4(), thiago.id, 'https://picsum.photos/seed/thiago2/400/300', 'Ciclovia! 🚴', 'Esportes']);

  // Fotos da Bianca
  await db.runAsync('INSERT INTO photos (id, owner_id, url, caption, album) VALUES (?, ?, ?, ?, ?)',
    [uuidv4(), bianca.id, 'https://picsum.photos/seed/bianca1/400/300', 'Meus pets ❤️', 'Pets']);
  await db.runAsync('INSERT INTO photos (id, owner_id, url, caption, album) VALUES (?, ?, ?, ?, ?)',
    [uuidv4(), bianca.id, 'https://picsum.photos/seed/bianca2/400/300', 'Adote um amigo! 🐕', 'Pets']);

  // Photo comments
  await db.runAsync('INSERT INTO photo_comments (id, photo_id, author_id, body) VALUES (?, ?, ?, ?)',
    [uuidv4(), p1id, ana.id, 'Que foto linda! 😍']);
  await db.runAsync('INSERT INTO photo_comments (id, photo_id, author_id, body) VALUES (?, ?, ?, ?)',
    [uuidv4(), p1id, carlos.id, 'Show demais! 🔥']);
  await db.runAsync('INSERT INTO photo_comments (id, photo_id, author_id, body) VALUES (?, ?, ?, ?)',
    [uuidv4(), p2id, juliana.id, 'Que lugar maravilhoso! Me leva! ✈️']);
  await db.runAsync('INSERT INTO photo_comments (id, photo_id, author_id, body) VALUES (?, ?, ?, ?)',
    [uuidv4(), ana1, demo.id, 'Linda como sempre! 🌟']);

  // Events
  const e1id = uuidv4(), e2id = uuidv4();
  await db.runAsync('INSERT INTO events (id, name, description, date, location, owner_id) VALUES (?, ?, ?, ?, ?, ?)',
    [e1id, 'Tukro Party 2026! 🎉', 'O primeiro evento oficial do Tukro!', '2026-03-15', 'São Paulo, SP', demo.id]);
  await db.runAsync('INSERT INTO events (id, name, description, date, location, owner_id) VALUES (?, ?, ?, ?, ?, ?)',
    [e2id, 'Show de Rock Nacional 🎸', 'Uma noite épica com as melhores bandas!', '2026-04-20', 'Rio de Janeiro, RJ', ana.id]);
  for (const [eid, uid] of [[e1id, demo.id], [e1id, ana.id], [e1id, carlos.id], [e2id, ana.id], [e2id, juliana.id]]) {
    await db.runAsync('INSERT INTO event_participants (id, event_id, user_id) VALUES (?, ?, ?)', [uuidv4(), eid, uid]);
  }
  await db.runAsync('INSERT INTO event_comments (id, event_id, author_id, body) VALUES (?, ?, ?, ?)',
    [uuidv4(), e1id, ana.id, 'Vou com certeza! Será incrível! 🎊']);

  // Videos
  const v1id = uuidv4();
  await db.runAsync('INSERT INTO videos (id, owner_id, url, title, views) VALUES (?, ?, ?, ?, ?)',
    [v1id, demo.id, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Meu vídeo favorito!', 142]);
  await db.runAsync('INSERT INTO videos (id, owner_id, url, title, views) VALUES (?, ?, ?, ?, ?)',
    [uuidv4(), ana.id, 'https://www.youtube.com/watch?v=L_jWHffIx5E', 'Música que amo 🎵', 89]);
  await db.runAsync('INSERT INTO video_comments (id, video_id, author_id, body) VALUES (?, ?, ?, ?)',
    [uuidv4(), v1id, ana.id, 'Clássico eterno! 🎶']);

  // Messages
  await db.runAsync('INSERT INTO messages (id, sender_id, receiver_id, body, read) VALUES (?, ?, ?, ?, ?)',
    [uuidv4(), ana.id, demo.id, 'Oi Demo! Tudo bem? Me adiciona lá! 😊', 0]);
  await db.runAsync('INSERT INTO messages (id, sender_id, receiver_id, body, read) VALUES (?, ?, ?, ?, ?)',
    [uuidv4(), carlos.id, demo.id, 'E aí cara! Bora jogar mais tarde?', 0]);
  await db.runAsync('INSERT INTO messages (id, sender_id, receiver_id, body, read) VALUES (?, ?, ?, ?, ?)',
    [uuidv4(), demo.id, ana.id, 'Oi Ana! Tudo ótimo! Obrigado pelo contato! 🙌', 1]);

  console.log('✅ Seed data inserted!');
}

module.exports = { db, initDB };
