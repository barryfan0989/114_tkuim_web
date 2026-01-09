import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db.js';
import authRouter from './routes/auth.js';
import tasksRouter from './routes/tasks.js';

const app = express();
const PORT = process.env.PORT || 3001;

// 中介層設定
app.use(cors({
  origin: (process.env.ALLOWED_ORIGIN || '*').split(','),
  credentials: true
}));
app.use(express.json());

// 請求日誌
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// 健康檢查端點
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Task Management API'
  });
});

// API 路由
app.use('/auth', authRouter);          // 認證相關（註冊、登入）
app.use('/api/tasks', tasksRouter);    // 任務 CRUD

// 404 處理
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `路徑 ${req.path} 不存在`,
    method: req.method
  });
});

// 全域錯誤處理
app.use((err, req, res, next) => {
  console.error('[錯誤]', err);

  // MongoDB 唯一索引衝突
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];
    return res.status(409).json({
      error: `${field} 已被使用`
    });
  }

  // JWT 驗證錯誤
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: '無效的認證令牌'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: '認證令牌已過期'
    });
  }

  // 其他錯誤
  res.status(err.status || 500).json({
    error: err.message || '伺服器內部錯誤'
  });
});

// 啟動伺服器
async function startServer() {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 伺服器運行於 http://localhost:${PORT}`);
      console.log(`📝 環境: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ 伺服器啟動失敗:', error);
    process.exit(1);
  }
}

startServer();
