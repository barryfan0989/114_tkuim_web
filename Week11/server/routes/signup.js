import express from 'express';
import {
  createParticipant,
  listParticipants,
  getParticipant,
  updateParticipant,
  deleteParticipant,
  findByEmail
} from '../repositories/participants.js';

const router = express.Router();

/**
 * POST /api/signup
 * 建立新報名
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, interests, status } = req.body;

    // 驗證必填欄位
    if (!name || !email || !phone) {
      return res.status(400).json({
        error: '缺少必要欄位',
        required: ['name', 'email', 'phone']
      });
    }

    // 驗證 email 格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Email 格式不正確'
      });
    }

    // 檢查 email 重複
    const existing = await findByEmail(email);
    if (existing) {
      return res.status(409).json({
        error: '該 Email 已報名過了'
      });
    }

    // 建立報名
    const id = await createParticipant({
      name,
      email,
      phone,
      interests: interests || [],
      status: status || 'pending'
    });

    res.status(201).json({
      message: '報名成功',
      participant: {
        id,
        name,
        email,
        phone,
        interests: interests || [],
        status: status || 'pending',
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/signup
 * 取得所有報名（支援分頁）
 */
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (page < 1 || limit < 1) {
      return res.status(400).json({
        error: 'page 與 limit 必須為正整數'
      });
    }

    const result = await listParticipants(page, limit);

    res.json({
      items: result.items,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: result.pages
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/signup/:id
 * 取得單筆報名
 */
router.get('/:id', async (req, res, next) => {
  try {
    const participant = await getParticipant(req.params.id);

    if (!participant) {
      return res.status(404).json({
        error: '找不到該報名紀錄'
      });
    }

    res.json({ participant });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/signup/:id
 * 更新報名（可更新 phone、status、interests 等）
 */
router.patch('/:id', async (req, res, next) => {
  try {
    const { phone, status, interests } = req.body;

    // 至少需要一個欄位
    if (!phone && !status && !interests) {
      return res.status(400).json({
        error: '至少需要提供一個欄位進行更新'
      });
    }

    const patch = {};
    if (phone) patch.phone = phone;
    if (status) patch.status = status;
    if (interests) patch.interests = interests;

    const result = await updateParticipant(req.params.id, patch);

    if (result.matchedCount === 0) {
      return res.status(404).json({
        error: '找不到該報名紀錄'
      });
    }

    if (result.modifiedCount === 0) {
      return res.json({
        message: '未有異動'
      });
    }

    res.json({
      message: '更新成功',
      updated: result.modifiedCount
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/signup/:id
 * 刪除報名
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await deleteParticipant(req.params.id);

    if (result.deletedCount === 0) {
      return res.status(404).json({
        error: '找不到該報名紀錄'
      });
    }

    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
