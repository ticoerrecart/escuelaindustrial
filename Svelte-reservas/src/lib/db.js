// src/lib/db.js
import Database from 'better-sqlite3';

// This will create (or open) a SQLite database file
const db = new Database('reservas.db');

// Create table if it doesn't exist
/*db.exec(`
  CREATE TABLE IF NOT EXISTS personas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
     fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`);
*/

export default db;
