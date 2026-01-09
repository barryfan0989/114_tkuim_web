// API 基礎設定
const API_BASE_URL = 'http://localhost:3001';

// 工具函數：顯示提示訊息
function showAlert(message, type = 'error') {
  const alertDiv = document.getElementById('alertMessage');
  if (!alertDiv) return;
  
  alertDiv.textContent = message;
  alertDiv.className = `alert alert-${type}`;
  alertDiv.style.display = 'block';
  
  setTimeout(() => {
    alertDiv.style.display = 'none';
  }, 5000);
}

// 工具函數：檢查是否已登入
async function checkAuth() {
  const token = localStorage.getItem('token');
  const currentPage = window.location.pathname;
  
  if (!token && !currentPage.includes('login') && !currentPage.includes('register')) {
    window.location.href = 'login.html';
    return false;
  }
  
  if (token && (currentPage.includes('login') || currentPage.includes('register'))) {
    window.location.href = 'index.html';
    return false;
  }
  
  // 若有 token，進一步向後端驗證有效性
  if (token) {
    try {
      const resp = await fetch(`${API_BASE_URL}/auth/verify`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resp.ok) {
        // 無效或過期的 token，清除並導向登入
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        showAlert('認證已失效，請重新登入');
        window.location.href = 'login.html';
        return false;
      }
    } catch (err) {
      // 無法連線時保守處理，維持現在頁面但提示
      console.warn('驗證 token 失敗:', err);
    }
  }
  
  return true;
}

// 登入表單處理
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const loginBtn = document.getElementById('loginBtn');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    loginBtn.disabled = true;
    loginBtn.textContent = '登入中...';
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // 儲存 token 和使用者資訊
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        showAlert('登入成功！正在跳轉...', 'success');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      } else {
        showAlert(data.error || '登入失敗，請檢查您的帳號密碼');
      }
    } catch (error) {
      console.error('登入錯誤:', error);
      showAlert('連線失敗，請確認伺服器是否正在運行');
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = '登入';
    }
  });
}

// 註冊表單處理
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const registerBtn = document.getElementById('registerBtn');
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // 驗證密碼
    if (password !== confirmPassword) {
      showAlert('兩次輸入的密碼不一致');
      return;
    }
    
    if (password.length < 6) {
      showAlert('密碼長度至少需要 6 個字元');
      return;
    }
    
    registerBtn.disabled = true;
    registerBtn.textContent = '註冊中...';
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // 儲存 token 和使用者資訊
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        showAlert('註冊成功！正在跳轉...', 'success');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      } else {
        showAlert(data.error || '註冊失敗，請稍後再試');
      }
    } catch (error) {
      console.error('註冊錯誤:', error);
      showAlert('連線失敗，請確認伺服器是否正在運行');
    } finally {
      registerBtn.disabled = false;
      registerBtn.textContent = '註冊';
    }
  });
}

// 頁面載入時檢查認證
checkAuth();
