import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);
let db;

export async function connectDB() {
  if (db) {
    console.log('[DB] Reusing existing connection');
    return db;
  }

  try {
    await client.connect();
    db = client.db();
    console.log('[DB] Connected to MongoDB successfully');
    return db;
  } catch (error) {
    console.error('[DB] Failed to connect:', error.message);
    throw error;
  }
}

export function getDB() {
  if (!db) throw new Error('[DB] Database not initialized. Call connectDB() first.');
  return db;
}

export function getCollection(name) {
  const database = getDB();
  return database.collection(name);
}

// 優雅關閉連線
process.on('SIGINT', async () => {
  if (db) {
    await client.close();
    console.log('[DB] Connection closed');
    process.exit(0);
  }
});
