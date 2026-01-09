import express from 'express';
import jwt from 'jsonwebtoken';
import userRepository from '../repositories/userRepository.js';

const router = express.Router();

/**
 * POST /auth/register
 * 使用者註冊
 */
router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // 驗證必填欄位
    if (!username || !email || !password) {
      return res.status(400).json({
        error: '缺少必要欄位',
        required: ['username', 'email', 'password']
      });
    }

    // 驗證 email 格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Email 格式不正確'
      });
    }

    // 驗證密碼長度
    if (password.length < 6) {
      return res.status(400).json({
        error: '密碼長度至少需要 6 個字元'
      });
    }

    // 檢查 email 是否已存在
    const existingEmail = await userRepository.findByEmail(email);
    if (existingEmail) {
      return res.status(409).json({
        error: 'Email 已被使用'
      });
    }

    // 檢查 username 是否已存在
    const existingUsername = await userRepository.findByUsername(username);
    if (existingUsername) {
      return res.status(409).json({
        error: 'Username 已被使用'
      });
    }

    // 建立使用者
    const user = await userRepository.create({ username, email, password });

    // 產生 JWT token
    const token = jwt.sign(
      { 
        userId: user._id.toString(), 
        email: user.email,
        username: user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: '註冊成功',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/login
 * 使用者登入
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 驗證必填欄位
    if (!email || !password) {
      return res.status(400).json({
        error: '請提供 email 和密碼'
      });
    }

    // 查詢使用者
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Email 或密碼錯誤'
      });
    }

    // 驗證密碼
    const isPasswordValid = await userRepository.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Email 或密碼錯誤'
      });
    }

    // 產生 JWT token
    const token = jwt.sign(
      { 
        userId: user._id.toString(), 
        email: user.email,
        username: user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: '登入成功',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /auth/verify
 * 驗證 token 是否有效
 */
router.get('/verify', async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ valid: false, error: '未提供 token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userRepository.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ valid: false, error: '使用者不存在' });
    }

    res.json({
      valid: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(401).json({ 
      valid: false, 
      error: error.name === 'TokenExpiredError' ? 'Token 已過期' : '無效的 token'
    });
  }
});

export default router;
