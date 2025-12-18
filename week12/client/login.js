// API 基礎 URL
const API_BASE = 'http://localhost:3001';

// 常用 DOM 元素
const authCard = document.getElementById('authCard');
const userCard = document.getElementById('userCard');
const authStatus = document.getElementById('authStatus');
const userInfo = document.getElementById('userInfo');

// 標籤頁
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// 表單與提示
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginAlert = document.getElementById('loginAlert');
const signupAlert = document.getElementById('signupAlert');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const logoutBtn = document.getElementById('logoutBtn');

// =====================================
// 初始化
// =====================================
function init() {
  checkAuthStatus();
  setupEventListeners();
}

function setupEventListeners() {
  // 標籤頁切換
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      
      // 更新按鈕狀態
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // 更新內容
      tabContents.forEach(content => content.classList.remove('active'));
      document.getElementById(`${tab}-tab`).classList.add('active');

      // 清除提示
      loginAlert.classList.remove('show');
      signupAlert.classList.remove('show');
    });
  });

  // 登入表單
  loginForm.addEventListener('submit', handleLogin);

  // 註冊表單
  signupForm.addEventListener('submit', handleSignup);

  // 登出按鈕
  logoutBtn.addEventListener('click', handleLogout);
}

// =====================================
// 認證狀態
// =====================================
function checkAuthStatus() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (token && user) {
    showUserCard(JSON.parse(user));
  } else {
    showAuthCard();
  }
}

function showAuthCard() {
  authCard.style.display = 'block';
  userCard.style.display = 'none';
}

function showUserCard(user) {
  authCard.style.display = 'none';
  userCard.style.display = 'block';

  userInfo.innerHTML = `
    <div class="status-item">
      <strong>名稱：</strong> ${user.name || user.email.split('@')[0]}
    </div>
    <div class="status-item">
      <strong>Email：</strong> ${user.email}
    </div>
    <div class="status-item">
      <strong>角色：</strong> ${user.role === 'admin' ? '📋 管理員' : '👤 學生'}
    </div>
    <div class="status-item">
      <strong>登入時間：</strong> ${new Date().toLocaleString('zh-TW')}
    </div>
  `;
}

// =====================================
// 登入
// =====================================
async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  clearAlert(loginAlert);
  loginBtn.disabled = true;
  loginBtn.innerHTML = '<span class="spinner"></span>登入中...';

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '登入失敗');
    }

    // 儲存 token 和使用者資訊
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    showAlert(loginAlert, `登入成功！歡迎 ${data.user.name || data.user.email}`, 'success');

    setTimeout(() => {
      checkAuthStatus();
      loginForm.reset();
    }, 1500);
  } catch (error) {
    showAlert(loginAlert, error.message, 'error');
  } finally {
    loginBtn.disabled = false;
    loginBtn.innerHTML = '登入';
  }
}

// =====================================
// 註冊
// =====================================
async function handleSignup(e) {
  e.preventDefault();

  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  clearAlert(signupAlert);
  signupBtn.disabled = true;
  signupBtn.innerHTML = '<span class="spinner"></span>註冊中...';

  try {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '註冊失敗');
    }

    // 儲存 token 和使用者資訊
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    showAlert(signupAlert, '註冊成功，帳號已自動登入！', 'success');

    setTimeout(() => {
      checkAuthStatus();
      signupForm.reset();
    }, 1500);
  } catch (error) {
    showAlert(signupAlert, error.message, 'error');
  } finally {
    signupBtn.disabled = false;
    signupBtn.innerHTML = '註冊';
  }
}

// =====================================
// 登出
// =====================================
function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  checkAuthStatus();
  showAlert(loginAlert, '已登出，歡迎再次使用', 'success');
  setTimeout(() => clearAlert(loginAlert), 3000);
}

// =====================================
// 輔助函數
// =====================================
function showAlert(element, message, type) {
  element.textContent = message;
  element.className = `alert show ${type}`;
}

function clearAlert(element) {
  element.textContent = '';
  element.classList.remove('show', 'error', 'success');
}

// 初始化應用
init();
