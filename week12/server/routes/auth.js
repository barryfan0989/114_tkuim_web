import express from 'express';
import bcrypt from 'bcrypt';
import { 
  findUserByEmail, 
  createUser, 
  userExists 
} from '../repositories/users.js';
import { 
  generateToken, 
  TOKEN_EXPIRES_IN 
} from '../utils/generateToken.js';

const router = express.Router();

/**
 * POST /auth/signup
 * 使用者註冊
 */
router.post('/signup', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // 驗證必填欄位
    if (!email || !password) {
      return res.status(400).json({
        error: '缺少必要欄位',
        required: ['email', 'password']
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
        error: '密碼長度至少 6 個字符'
      });
    }

    // 檢查 email 是否已被註冊
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({
        error: 'Email 已被註冊'
      });
    }

    // bcrypt 雜湊密碼
    const passwordHash = await bcrypt.hash(password, 10);

    // 建立使用者
    const user = await createUser({
      email,
      passwordHash,
      role: 'student',
      name: name || email.split('@')[0]
    });

    // 簽發 token
    const token = generateToken(user);

    res.status(201).json({
      message: '註冊成功',
      token,
      expiresIn: TOKEN_EXPIRES_IN,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name
      }
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
        error: '缺少必要欄位',
        required: ['email', 'password']
      });
    }

    // 查詢使用者
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Email 或密碼錯誤'
      });
    }

    // 驗證密碼
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Email 或密碼錯誤'
      });
    }

    // 簽發 token
    const token = generateToken(user);

    res.json({
      message: '登入成功',
      token,
      expiresIn: TOKEN_EXPIRES_IN,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name || email.split('@')[0]
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /auth/me
 * 取得目前登入使用者資訊（可選）
 */
router.get('/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      error: '未登入'
    });
  }

  res.json({
    user: req.user
  });
});

export default router;
