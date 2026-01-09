import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import taskRepository from '../repositories/taskRepository.js';

const router = express.Router();

// 所有路由都需要驗證
router.use(authenticateToken);

/**
 * POST /api/tasks
 * 新增任務 (Create)
 */
router.post('/', async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    const userId = req.user.userId;

    // 驗證必填欄位
    if (!title) {
      return res.status(400).json({
        error: '任務標題為必填欄位'
      });
    }

    // 建立任務
    const taskData = {
      userId,
      title: title.trim(),
      description: description?.trim() || '',
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : null
    };

    const task = await taskRepository.create(taskData);

    res.status(201).json({
      message: '任務新增成功',
      task
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tasks
 * 取得任務列表 (Read All)
 * 支援查詢參數: status, priority, search, sortBy, sortOrder, page, limit
 */
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const {
      status,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 50
    } = req.query;

    // 建立過濾條件
    const filters = {
      userId,
      ...(status && { status }),
      ...(priority && { priority }),
      ...(search && { searchText: search })
    };

    // 分頁設定
    const options = {
      sortBy,
      sortOrder,
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    };

    const result = await taskRepository.findAll(filters, options);

    res.json({
      ...result,
      filters: {
        status: status || 'all',
        priority: priority || 'all',
        search: search || ''
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tasks/statistics
 * 取得任務統計
 */
router.get('/statistics', async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const stats = await taskRepository.getStatistics(userId);
    
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tasks/:id
 * 取得單一任務 (Read One)
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const task = await taskRepository.findById(id);

    if (!task) {
      return res.status(404).json({
        error: '任務不存在'
      });
    }

    // 確認任務屬於當前使用者
    if (task.userId.toString() !== userId) {
      return res.status(403).json({
        error: '無權限存取此任務'
      });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/tasks/:id
 * 更新任務 (Update)
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { title, description, status, priority, dueDate } = req.body;

    // 確認任務存在且屬於當前使用者
    const existingTask = await taskRepository.findById(id);
    
    if (!existingTask) {
      return res.status(404).json({
        error: '任務不存在'
      });
    }

    if (existingTask.userId.toString() !== userId) {
      return res.status(403).json({
        error: '無權限修改此任務'
      });
    }

    // 準備更新資料
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    const updatedTask = await taskRepository.update(id, updateData);

    res.json({
      message: '任務更新成功',
      task: updatedTask
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/tasks/:id
 * 刪除任務 (Delete)
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // 確認任務存在且屬於當前使用者
    const task = await taskRepository.findById(id);
    
    if (!task) {
      return res.status(404).json({
        error: '任務不存在'
      });
    }

    if (task.userId.toString() !== userId) {
      return res.status(403).json({
        error: '無權限刪除此任務'
      });
    }

    const success = await taskRepository.delete(id);

    if (success) {
      res.json({
        message: '任務刪除成功'
      });
    } else {
      res.status(500).json({
        error: '刪除失敗'
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/tasks
 * 批次刪除任務
 */
router.delete('/', async (req, res, next) => {
  try {
    const { taskIds } = req.body;
    const userId = req.user.userId;

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({
        error: '請提供要刪除的任務 ID 陣列'
      });
    }

    // 驗證所有任務都屬於當前使用者
    const tasks = await Promise.all(
      taskIds.map(id => taskRepository.findById(id))
    );

    const invalidTasks = tasks.filter(
      task => !task || task.userId.toString() !== userId
    );

    if (invalidTasks.length > 0) {
      return res.status(403).json({
        error: '部分任務不存在或無權限刪除'
      });
    }

    const deletedCount = await taskRepository.deleteMany(taskIds);

    res.json({
      message: `成功刪除 ${deletedCount} 個任務`,
      deletedCount
    });
  } catch (error) {
    next(error);
  }
});

export default router;
