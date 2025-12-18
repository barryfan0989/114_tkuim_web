// Week12 MongoDB 初始化腳本
db = db.getSiblingDB('week12');

// 建立應用使用者
db.createUser({
  user: 'week12-admin',
  pwd: 'week12-pass',
  roles: [{ role: 'readWrite', db: 'week12' }]
});

// =====================
// 建立 participants 集合（來自 Week11 的報名資料）
// =====================
db.createCollection('participants');

// 建立 ownerId 索引（用於快速查詢使用者的報名資料）
db.participants.createIndex({ ownerId: 1 });

// 建立 email 唯一索引
db.participants.createIndex({ email: 1 }, { unique: true });

// =====================
// 建立 users 集合（新增的使用者帳號系統）
// =====================
db.createCollection('users');

// 建立 email 唯一索引
db.users.createIndex({ email: 1 }, { unique: true });

// =====================
// 預先建立測試帳號
// =====================
// 密碼均為 test1234（已用 bcrypt 雜湊，salt=10）
// 生成方式：node -e "const bcrypt = require('bcrypt'); console.log(bcrypt.hashSync('test1234', 10))"

const adminHash = '$2b$10$4P6uyrAvH/e0K9eP1zN8TOTBuKY7EZSzS16mL0.vLdHzLsWHhQx6q'; // test1234
const studentHash = '$2b$10$4P6uyrAvH/e0K9eP1zN8TOTBuKY7EZSzS16mL0.vLdHzLsWHhQx6q'; // test1234

// 管理員帳號
db.users.insertOne({
  email: 'admin@example.com',
  passwordHash: adminHash,
  role: 'admin',
  name: '系統管理員',
  createdAt: new Date(),
  updatedAt: new Date()
});

// 學生帳號 1
db.users.insertOne({
  email: 'student1@example.com',
  passwordHash: studentHash,
  role: 'student',
  name: '學生1',
  createdAt: new Date(),
  updatedAt: new Date()
});

// 學生帳號 2
db.users.insertOne({
  email: 'student2@example.com',
  passwordHash: studentHash,
  role: 'student',
  name: '學生2',
  createdAt: new Date(),
  updatedAt: new Date()
});

// 個人帳號 - 范植翔
const barryHash = '$2b$10$X0FV7qFlyeuM37XPjBOtlOlFpVGXPVNKXhtvV2L9l5fODXA51KtNG'; // barry0803
db.users.insertOne({
  email: 'Barryfan0803@gmail.com',
  passwordHash: barryHash,
  role: 'student',
  name: '范植翔',
  userId: 413637454,
  createdAt: new Date(),
  updatedAt: new Date()
});

console.log('[Mongo Init] Week12 database initialized');
console.log('[Mongo Init] Test accounts created:');
console.log('  Admin: admin@example.com (pwd: test1234)');
console.log('  Student1: student1@example.com (pwd: test1234)');
console.log('  Student2: student2@example.com (pwd: test1234)');
console.log('  📝 Your Account: Barryfan0803@gmail.com (pwd: barry0803)');
