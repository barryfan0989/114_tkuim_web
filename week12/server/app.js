import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db.js';
import authRouter from './routes/auth.js';
import signupRouter from './routes/signup.js';

const app = express();
const PORT = process.env.PORT || 3001;

// 中介層
app.use(cors({
  origin: (process.env.ALLOWED_ORIGIN || '*').split(','),
  credentials: true
}));
app.use(express.json());

// 健康檢查（無需認證）
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 認證路由（無需認證）
app.use('/auth', authRouter);

// API 路由（需要認證）
app.use('/api/signup', signupRouter);

// 404 處理
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method
  });
});

// 全域錯誤處理
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);

  // MongoDB 唯一索引違反
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      error: `${field} 已存在`
    });
  }

  // 其他錯誤
  res.status(err.status || 500).json({
    error: err.message || 'Server Error'
  });
});

// 啟動伺服器
async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[Server] Running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('[Server] Failed to start:', error.message);
    process.exit(1);
  }
}

start();

export default app;
