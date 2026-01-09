import { ObjectId } from 'mongodb';
import { getDB } from '../db.js';
import bcrypt from 'bcryptjs';

/**
 * UserRepository - 使用者資料存取層
 * 實作 Repository Pattern
 */
class UserRepository {
  constructor() {
    this.collectionName = 'users';
  }

  getCollection() {
    const db = getDB();
    return db.collection(this.collectionName);
  }

  /**
   * 新增使用者
   */
  async create(userData) {
    const collection = this.getCollection();
    
    // 密碼加密
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = {
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(user);
    
    // 回傳時移除密碼
    const { password, ...userWithoutPassword } = user;
    return {
      _id: result.insertedId,
      ...userWithoutPassword
    };
  }

  /**
   * 根據 email 查詢使用者
   */
  async findByEmail(email) {
    const collection = this.getCollection();
    return await collection.findOne({ email });
  }

  /**
   * 根據 username 查詢使用者
   */
  async findByUsername(username) {
    const collection = this.getCollection();
    return await collection.findOne({ username });
  }

  /**
   * 根據 ID 查詢使用者
   */
  async findById(userId) {
    const collection = this.getCollection();
    const user = await collection.findOne({ _id: new ObjectId(userId) });
    
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    
    return null;
  }

  /**
   * 驗證使用者密碼
   */
  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * 更新使用者資料
   */
  async update(userId, updateData) {
    const collection = this.getCollection();
    const { password, ...allowedUpdates } = updateData;
    
    const updates = {
      ...allowedUpdates,
      updatedAt: new Date()
    };
    
    // 如果要更新密碼，需要加密
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (result) {
      const { password: _, ...userWithoutPassword } = result;
      return userWithoutPassword;
    }
    
    return null;
  }
}

export default new UserRepository();
