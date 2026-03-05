const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'tukro.db'));

const demoId = '2b42a3a4-e793-4a02-b51b-e09a242c418e';

db.all('SELECT COUNT(*) as c FROM friends WHERE user_id = ? AND status = "accepted"', [demoId], (err, rows) => {
    console.log('FRIENDS COUNT FOR USER_ID', demoId, rows);
});

db.all('SELECT COUNT(*) as c FROM community_members WHERE user_id = ?', [demoId], (err, rows) => {
    console.log('COMMUNITY COUNT FOR USER_ID', demoId, rows);
});

db.all('SELECT * FROM friends WHERE friend_id = ?', [demoId], (err, rows) => {
    console.log('REVERSE FRIENDS FOR USER_ID', demoId, rows.length);
    db.close();
});
