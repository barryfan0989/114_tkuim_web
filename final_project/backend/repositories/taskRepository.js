import { ObjectId } from 'mongodb';
import { getDB } from '../db.js';

/**
 * TaskRepository - 任務資料存取層
 * 實作 Repository Pattern 分離資料存取邏輯
 */
class TaskRepository {
  constructor() {
    this.collectionName = 'tasks';
  }

  /**
   * 取得 tasks collection
   */
  getCollection() {
    const db = getDB();
    return db.collection(this.collectionName);
  }

  /**
   * 新增任務 (Create)
   */
  async create(taskData) {
    const collection = this.getCollection();
    // 確保 userId 以 ObjectId 形式儲存
    const normalizedUserId = taskData.userId ? new ObjectId(taskData.userId) : undefined;
    const task = {
      ...taskData,
      ...(normalizedUserId && { userId: normalizedUserId }),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(task);
    return {
      _id: result.insertedId,
      ...task
    };
  }

  /**
   * 取得所有任務 (Read All)
   * 支援過濾、排序、分頁
   */
  async findAll(filters = {}, options = {}) {
    const collection = this.getCollection();
    const {
      userId,
      status,
      priority,
      searchText
    } = filters;

    const {
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = 100,
      skip = 0
    } = options;

    // 建立查詢條件
    const query = {};
    
    if (userId) {
      // 同時支援舊資料（字串）與新資料（ObjectId）
      query.userId = { $in: [new ObjectId(userId), userId] };
    }
    
    if (status) {
      query.status = status;
    }
    
    if (priority) {
      query.priority = priority;
    }
    
    if (searchText) {
      query.$or = [
        { title: { $regex: searchText, $options: 'i' } },
        { description: { $regex: searchText, $options: 'i' } }
      ];
    }

    // 排序
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const tasks = await collection
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await collection.countDocuments(query);

    return {
      tasks,
      total,
      page: Math.floor(skip / limit) + 1,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * 根據 ID 取得單一任務 (Read One)
   */
  async findById(taskId) {
    const collection = this.getCollection();
    return await collection.findOne({ _id: new ObjectId(taskId) });
  }

  /**
   * 更新任務 (Update)
   */
  async update(taskId, updateData) {
    const collection = this.getCollection();
    const { _id, createdAt, ...allowedUpdates } = updateData;
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(taskId) },
      { 
        $set: {
          ...allowedUpdates,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    return result;
  }

  /**
   * 刪除任務 (Delete)
   */
  async delete(taskId) {
    const collection = this.getCollection();
    const result = await collection.deleteOne({ 
      _id: new ObjectId(taskId) 
    });
    
    return result.deletedCount > 0;
  }

  /**
   * 批次刪除任務
   */
  async deleteMany(taskIds) {
    const collection = this.getCollection();
    const objectIds = taskIds.map(id => new ObjectId(id));
    
    const result = await collection.deleteMany({
      _id: { $in: objectIds }
    });
    
    return result.deletedCount;
  }

  /**
   * 取得使用者的任務統計
   */
  async getStatistics(userId) {
    const collection = this.getCollection();
    
    const stats = await collection.aggregate([
      { $match: { userId: { $in: [new ObjectId(userId), userId] } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const result = {
      total: 0,
      todo: 0,
      inProgress: 0,
      completed: 0
    };

    stats.forEach(stat => {
      result.total += stat.count;
      result[stat._id] = stat.count;
    });

    return result;
  }
}

// 導出 Singleton 實例
export default new TaskRepository();
