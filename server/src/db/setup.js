// run once: node src/db/setup.js
const db   = require('./database');
const fs   = require('fs');
const path = require('path');

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);
console.log('Schema applied');

// ── safe migrations for existing databases ────────────────────
function addColumnIfMissing(table, column, definition) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!cols.find(c => c.name === column)) {
    db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`).run();
    console.log(`  + ${table}.${column}`);
  }
}

addColumnIfMissing('order_item',   'color',  'VARCHAR(100)');
addColumnIfMissing('order_item',   'size',   'VARCHAR(100)');
addColumnIfMissing('notification', 'title',  'VARCHAR(200) NOT NULL DEFAULT \'\'');
addColumnIfMissing('notification', 'link',   'VARCHAR(500)');

// seed settings defaults
db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('shipping_fee','9.90')`).run();
db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('free_shipping_threshold','100')`).run();

console.log('Migrations applied');

require('./seed');
