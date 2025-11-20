const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("database.sqlite");

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        filename TEXT,
        originalname TEXT,
        size INTEGER,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
});

module.exports = db;