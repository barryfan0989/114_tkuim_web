import { ObjectId } from 'mongodb';
import { getDB } from '../db.js';

const collection = () => getDB().collection('participants');

/**
 * 建立新的報名紀錄
 */
export async function createParticipant(data) {
  const result = await collection().insertOne({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return result.insertedId;
}

/**
 * 取得所有報名紀錄（支援分頁）
 */
export async function listParticipants(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const items = await collection()
    .find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  const total = await collection().countDocuments();

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

/**
 * 根據 ID 取得單筆紀錄
 */
export async function getParticipant(id) {
  try {
    return await collection().findOne({ _id: new ObjectId(id) });
  } catch (error) {
    return null;
  }
}

/**
 * 更新報名紀錄
 */
export async function updateParticipant(id, patch) {
  try {
    const result = await collection().updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...patch, updatedAt: new Date() } }
    );
    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * 刪除報名紀錄
 */
export async function deleteParticipant(id) {
  try {
    const result = await collection().deleteOne({ _id: new ObjectId(id) });
    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * 根據 email 查詢（用於檢查重複）
 */
export async function findByEmail(email) {
  return await collection().findOne({ email });
}
