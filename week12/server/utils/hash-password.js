import bcrypt from 'bcrypt';

async function hashPassword(password) {
  if (!password) {
    console.error('請提供密碼作為參數');
    console.error('使用方式: node utils/hash-password.js <password>');
    process.exit(1);
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    console.log('\n=== Bcrypt 密碼雜湊 ===');
    console.log(`原始密碼: ${password}`);
    console.log(`雜湊結果: ${hash}`);
    console.log('\n將上述雜湊值複製到 mongo-init.js 中的 passwordHash 欄位\n');
  } catch (error) {
    console.error('雜湊失敗:', error.message);
    process.exit(1);
  }
}

const password = process.argv[2];
hashPassword(password);
