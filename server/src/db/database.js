// Node.js v22+ has sqlite built-in — no extra package needed
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const db = new DatabaseSync(path.join(__dirname, '../../masa.db'));

db.exec('PRAGMA foreign_keys = ON');
db.exec('PRAGMA journal_mode = WAL');

module.exports = db;
