import { MongoClient } from 'mongodb';

let db = null;
let client = null;

/**
 * 連接到 MongoDB 資料庫
 * 使用 Singleton Pattern 確保只有一個資料庫連線實例
 */
export async function connectDB() {
  if (db) {
    console.log('✅ 使用現有的資料庫連線');
    return db;
  }

  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/task_management';
    const dbName = process.env.DB_NAME || 'task_management';

    client = new MongoClient(uri);
    await client.connect();
    
    db = client.db(dbName);
    
    console.log('✅ MongoDB 連線成功:', dbName);
    
    // 建立索引
    await createIndexes(db);
    
    return db;
  } catch (error) {
    console.error('❌ MongoDB 連線失敗:', error.message);
    throw error;
  }
}

/**
 * 建立資料庫索引以提升查詢效能
 */
async function createIndexes(database) {
  try {
    // Users collection 索引
    await database.collection('users').createIndex({ email: 1 }, { unique: true });
    await database.collection('users').createIndex({ username: 1 }, { unique: true });
    
    // Tasks collection 索引
    await database.collection('tasks').createIndex({ userId: 1 });
    await database.collection('tasks').createIndex({ status: 1 });
    await database.collection('tasks').createIndex({ createdAt: -1 });
    await database.collection('tasks').createIndex({ userId: 1, status: 1 });
    
    console.log('✅ 資料庫索引建立完成');
  } catch (error) {
    console.error('⚠️ 索引建立警告:', error.message);
  }
}

/**
 * 取得資料庫實例
 */
export function getDB() {
  if (!db) {
    throw new Error('資料庫尚未連線，請先呼叫 connectDB()');
  }
  return db;
}

/**
 * 關閉資料庫連線
 */
export async function closeDB() {
  if (client) {
    await client.close();
    db = null;
    client = null;
    console.log('✅ MongoDB 連線已關閉');
  }
}

// 優雅關閉
process.on('SIGINT', async () => {
  await closeDB();
  process.exit(0);
});
