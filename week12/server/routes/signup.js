import express from 'express';
import {
  createParticipant,
  listParticipants,
  listParticipantsByOwner,
  getParticipant,
  updateParticipant,
  deleteParticipant,
  findByEmail,
  serializeParticipant
} from '../repositories/participants.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// 所有路由都需要認證
router.use(authMiddleware);

/**
 * GET /api/signup
 * 取得報名資料
 * - 學生只能看自己的資料
 * - admin 可看全部資料
 */
router.get('/', async (req, res, next) => {
  try {
    let data;

    if (req.user.role === 'admin') {
      // admin 查看所有資料
      data = await listParticipants();
    } else {
      // 學生只能查看自己的資料
      data = await listParticipantsByOwner(req.user.id);
    }

    const serialized = data.map(serializeParticipant);

    res.json({
      total: serialized.length,
      data: serialized
    });
  } catch (error) {
    next(error);
  }
});

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
        error: 'Email 已被註冊'
      });
    }

    // 建立報名（帶上 ownerId）
    const participant = await createParticipant({
      name,
      email,
      phone,
      interests: interests || [],
      ownerId: req.user.id,
      status: status || 'pending'
    });

    res.status(201).json({
      message: '報名成功',
      data: serializeParticipant(participant)
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/signup/:id
 * 取得單筆報名資料
 */
router.get('/:id', async (req, res, next) => {
  try {
    const participant = await getParticipant(req.params.id);

    if (!participant) {
      return res.status(404).json({
        error: '報名資料不存在'
      });
    }

    // 權限檢查：只有資料擁有者或 admin 可以看
    const isOwner = participant.ownerId.toString() === req.user.id;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({
        error: '權限不足'
      });
    }

    res.json({
      data: serializeParticipant(participant)
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/signup/:id
 * 更新報名資料
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { name, phone, interests, status } = req.body;

    const participant = await getParticipant(req.params.id);

    if (!participant) {
      return res.status(404).json({
        error: '報名資料不存在'
      });
    }

    // 權限檢查：只有資料擁有者或 admin 可以修改
    const isOwner = participant.ownerId.toString() === req.user.id;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({
        error: '權限不足'
      });
    }

    // 準備更新資料
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (interests !== undefined) updates.interests = interests;
    if (status !== undefined && req.user.role === 'admin') {
      updates.status = status;
    }

    const updated = await updateParticipant(req.params.id, updates);

    if (!updated) {
      return res.status(500).json({
        error: '更新失敗'
      });
    }

    const newParticipant = await getParticipant(req.params.id);

    res.json({
      message: '更新成功',
      data: serializeParticipant(newParticipant)
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/signup/:id
 * 刪除報名資料
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const participant = await getParticipant(req.params.id);

    if (!participant) {
      return res.status(404).json({
        error: '報名資料不存在'
      });
    }

    // 權限檢查：只有資料擁有者或 admin 可以刪除
    const isOwner = participant.ownerId.toString() === req.user.id;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({
        error: '權限不足'
      });
    }

    const deleted = await deleteParticipant(req.params.id);

    if (!deleted) {
      return res.status(500).json({
        error: '刪除失敗'
      });
    }

    res.json({
      message: '刪除完成',
      data: serializeParticipant(participant)
    });
  } catch (error) {
    next(error);
  }
});

export default router;
