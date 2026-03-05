const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'tukro.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run("ALTER TABLE messages ADD COLUMN deleted_by_sender INTEGER DEFAULT 0;", (err) => {
        if (err) console.log("deleted_by_sender already exists or error:", err.message);
        else console.log("Added deleted_by_sender");
    });
    db.run("ALTER TABLE messages ADD COLUMN deleted_by_receiver INTEGER DEFAULT 0;", (err) => {
        if (err) console.log("deleted_by_receiver already exists or error:", err.message);
        else console.log("Added deleted_by_receiver");
    });
});
db.close();
