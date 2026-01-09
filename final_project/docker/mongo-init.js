// MongoDB 初始化腳本
db = db.getSiblingDB('task_management');

// 建立 users collection 並設定索引
db.createCollection('users');
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });

// 建立 tasks collection 並設定索引
db.createCollection('tasks');
db.tasks.createIndex({ "userId": 1 });
db.tasks.createIndex({ "status": 1 });
db.tasks.createIndex({ "createdAt": -1 });
db.tasks.createIndex({ "userId": 1, "status": 1 });

print('✅ Task Management 資料庫初始化完成');
