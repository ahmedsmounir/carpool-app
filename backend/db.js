const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

let db;

const connectDB = async () => {
  db = await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('driver', 'partner'))
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      driverId INTEGER NOT NULL,
      day TEXT NOT NULL,
      timeSlot TEXT NOT NULL,
      origin TEXT NOT NULL,
      availableSeats INTEGER NOT NULL,
      gasCost REAL NOT NULL,
      FOREIGN KEY(driverId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scheduleId INTEGER NOT NULL,
      partnerId INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      splitAmount REAL,
      FOREIGN KEY(scheduleId) REFERENCES schedules(id),
      FOREIGN KEY(partnerId) REFERENCES users(id)
    );
  `);

  console.log(`SQLite database successfully connected and tables created`);
  return db;
};

const getDB = () => db;

const disconnectDB = async () => {
  if (db) {
    await db.close();
    console.log('SQLite database disconnected');
  }
};

module.exports = { connectDB, getDB, disconnectDB };
