import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export const initDb = async () => {
  if (db) return db;
  
  db = await SQLite.openDatabaseAsync('darion_academy.db');
  
  // Create tables for offline data
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS offline_courses (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS offline_lessons (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      data TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action_type TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      status TEXT DEFAULT 'pending'
    );
  `);
  
  return db;
};

export const getDb = () => {
  if (!db) throw new Error("Database not initialized. Call initDb() first.");
  return db;
};

// Helper methods for offline courses
export const saveOfflineCourse = async (id: string, data: any) => {
  const database = await initDb();
  await database.runAsync(
    'INSERT OR REPLACE INTO offline_courses (id, data, updated_at) VALUES (?, ?, ?)',
    [id, JSON.stringify(data), Date.now()]
  );
};

export const getOfflineCourse = async (id: string) => {
  const database = await initDb();
  const row = await database.getFirstAsync<{ data: string }>('SELECT data FROM offline_courses WHERE id = ?', [id]);
  return row ? JSON.parse(row.data) : null;
};
