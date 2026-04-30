import sqlite3 from 'sqlite3';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const databasePath = path.join(__dirname, '../../data/bot.sqlite');

let db;

function createStatementRunner(method) {
  return (sql, params = []) => new Promise((resolve, reject) => {
    if (!db) return reject(new Error('Base de datos no inicializada'));
    db[method](sql, params, function (error, result) {
      if (error) return reject(error);
      resolve(method === 'run' ? { lastID: this.lastID, changes: this.changes } : result);
    });
  });
}

export const run = createStatementRunner('run');
export const get = createStatementRunner('get');
export const all = createStatementRunner('all');

export async function initializeDatabase() {
  await mkdir(path.join(__dirname, '../../data'), { recursive: true });

  db = await new Promise((resolve, reject) => {
    const database = new sqlite3.Database(databasePath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (error) => {
      if (error) return reject(error);
      resolve(database);
    });
  });

  await run(`PRAGMA journal_mode = WAL;`);
  await run(`CREATE TABLE IF NOT EXISTS warn (
    id TEXT PRIMARY KEY,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    moderator_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    timestamp TEXT NOT NULL
  );`);

  await run(`CREATE INDEX IF NOT EXISTS warn_by_guild_user ON warn (guild_id, user_id);`);

  await run(`CREATE TABLE IF NOT EXISTS log_channel (
    guild_id TEXT PRIMARY KEY,
    channel_id TEXT NOT NULL
  );`);

  await run(`CREATE TABLE IF NOT EXISTS reminder (
    id TEXT PRIMARY KEY,
    guild_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    message TEXT NOT NULL,
    minutes INTEGER NOT NULL,
    times INTEGER NOT NULL DEFAULT 0,
    sent_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    last_sent TEXT,
    UNIQUE(guild_id, channel_id, user_id)
  );`);
}
