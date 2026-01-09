import jwt from 'jsonwebtoken';

/**
 * JWT 認證中介層
 * 驗證請求標頭中的 JWT token
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: '未提供認證令牌',
      message: '請先登入'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, email, username }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: '認證令牌已過期',
        message: '請重新登入'
      });
    }
    return res.status(403).json({ 
      error: '無效的認證令牌'
    });
  }
}

/**
 * 選擇性認證中介層
 * 如果有 token 就驗證，沒有則繼續
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Token 無效時不阻擋請求，但不設定 user
    }
  }
  
  next();
}
