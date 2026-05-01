// better-sqlite3 — works with Node 14+, no special flags needed
const Database = require('better-sqlite3');
const path     = require('path');

const db = new Database(path.join(__dirname, '../../masa.db'));

db.exec('PRAGMA foreign_keys = ON');
db.exec('PRAGMA journal_mode = WAL');

module.exports = db;
