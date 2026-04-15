// run once: node src/db/setup.js
const db   = require('./database');
const fs   = require('fs');
const path = require('path');

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);
console.log('Schema applied');

require('./seed');
