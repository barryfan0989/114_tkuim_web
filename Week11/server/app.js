import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db.js';
import signupRouter from './routes/signup.js';

const app = express();

// 中介層
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());

// 健康檢查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 路由
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

const port = process.env.PORT || 3001;

// 啟動伺服器
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`[Server] Running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('[Server] Failed to start:', error.message);
    process.exit(1);
  });
