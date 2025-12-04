// 建立應用使用者
db.createUser({
  user: 'week11-user',
  pwd: 'week11-pass',
  roles: [{ role: 'readWrite', db: 'week11' }]
});

// 建立集合
db.createCollection('participants');

// 插入初始範例資料
db.participants.insertOne({
  name: '示範學員',
  email: 'demo@example.com',
  phone: '0912345678',
  status: 'pending',
  interests: ['前端', '後端'],
  createdAt: new Date(),
  updatedAt: new Date()
});

// 建立 email 唯一索引
db.participants.createIndex({ email: 1 }, { unique: true });

console.log('[Mongo Init] Database initialized');
