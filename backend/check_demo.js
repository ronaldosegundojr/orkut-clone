const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'tukro.db'));

db.get('SELECT * FROM users WHERE username = ?', ['Demo User'], (err, row) => {
    if (err) console.error(err);
    else console.log(JSON.stringify(row, null, 2));
    db.close();
});
