// API 基礎 URL
const API_BASE = 'http://localhost:3001';

// DOM 元素
const formCard = document.getElementById('formCard');
const listCard = document.getElementById('listCard');
const notLoggedInAlert = document.getElementById('notLoggedInAlert');
const systemAlert = document.getElementById('systemAlert');
const signupForm = document.getElementById('signupForm');
const submitBtn = document.getElementById('submitBtn');
const dataList = document.getElementById('dataList');
const userInfo = document.getElementById('userInfo');
const userName = document.getElementById('userName');
const userRole = document.getElementById('userRole');
const loginLink = document.getElementById('loginLink');
const logoutBtn = document.getElementById('logoutBtn');
const deleteModal = document.getElementById('deleteModal');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// 狀態
let currentUser = null;
let currentToken = null;
let pendingDeleteId = null;

// =====================================
// 初始化
// =====================================
function init() {
  checkAuth();
  setupEventListeners();
  loadData();
}

function setupEventListeners() {
  signupForm?.addEventListener('submit', handleFormSubmit);
  logoutBtn?.addEventListener('click', handleLogout);
  cancelDeleteBtn?.addEventListener('click', () => deleteModal.classList.remove('show'));
  confirmDeleteBtn?.addEventListener('click', confirmDelete);
}

// =====================================
// 認證管理
// =====================================
function checkAuth() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (token && user) {
    currentToken = token;
    currentUser = JSON.parse(user);
    showAuthenticatedUI();
  } else {
    currentToken = null;
    currentUser = null;
    showUnauthenticatedUI();
  }
}

function showAuthenticatedUI() {
  notLoggedInAlert.style.display = 'none';
  formCard.style.display = 'block';
  listCard.style.display = 'block';
  userInfo.style.display = 'block';
  loginLink.style.display = 'none';
  logoutBtn.style.display = 'block';

  userName.textContent = currentUser.name || currentUser.email.split('@')[0];
  userRole.textContent = currentUser.role === 'admin' ? '📋 管理員' : '👤 學生';
}

function showUnauthenticatedUI() {
  notLoggedInAlert.style.display = 'block';
  formCard.style.display = 'none';
  listCard.style.display = 'none';
  userInfo.style.display = 'none';
  loginLink.style.display = 'block';
  logoutBtn.style.display = 'none';
}

function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  checkAuth();
  showAlert('已登出', 'success');
  dataList.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">👋</div>
      <p>歡迎再次使用</p>
    </div>
  `;
}

// =====================================
// 表單提交
// =====================================
async function handleFormSubmit(e) {
  e.preventDefault();

  const formData = new FormData(signupForm);
  const name = formData.get('name').trim();
  const email = formData.get('email').trim();
  const phone = formData.get('phone').trim();
  const interestsStr = formData.get('interests').trim();
  const interests = interestsStr ? interestsStr.split(',').map(i => i.trim()) : [];

  // 簡單驗證
  if (!name || !email || !phone) {
    showAlert('請填寫所有必填欄位', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner"></span>提交中...';

  try {
    const response = await fetch(`${API_BASE}/api/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ name, email, phone, interests })
    });

    const data = await response.json();

    if (!response.ok) {
      // Token 過期或無效
      if (response.status === 401) {
        handleTokenExpired();
        return;
      }
      throw new Error(data.error || '提交失敗');
    }

    showAlert('報名成功！', 'success');
    signupForm.reset();
    loadData();
  } catch (error) {
    showAlert(error.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '送出報名';
  }
}

// =====================================
// 資料列表
// =====================================
async function loadData() {
  if (!currentUser) return;

  try {
    const response = await fetch(`${API_BASE}/api/signup`, {
      headers: {
        'Authorization': `Bearer ${currentToken}`
      }
    });

    if (response.status === 401) {
      handleTokenExpired();
      return;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '載入失敗');
    }

    renderDataList(data.data || []);
  } catch (error) {
    showAlert(error.message, 'error');
    dataList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">❌</div>
        <p>無法載入資料</p>
      </div>
    `;
  }
}

function renderDataList(items) {
  if (!items || items.length === 0) {
    dataList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <p>沒有報名資料</p>
      </div>
    `;
    return;
  }

  dataList.innerHTML = items.map(item => `
    <div class="data-item">
      <div class="data-header">
        <div>
          <div class="data-name">${escapeHtml(item.name)}</div>
          <div class="data-badge">${item.status === 'pending' ? '⏳ 待審' : '✅ 已審'}</div>
        </div>
      </div>
      <div class="data-fields">
        <div class="data-field">
          <span class="data-field-label">📧 Email：</span>
          <span class="data-field-value">${escapeHtml(item.email)}</span>
        </div>
        <div class="data-field">
          <span class="data-field-label">📱 電話：</span>
          <span class="data-field-value">${escapeHtml(item.phone)}</span>
        </div>
        ${item.interests && item.interests.length > 0 ? `
          <div class="data-field">
            <span class="data-field-label">🎯 興趣：</span>
            <span class="data-field-value">${escapeHtml(item.interests.join(', '))}</span>
          </div>
        ` : ''}
        <div class="data-field">
          <span class="data-field-label">📅 時間：</span>
          <span class="data-field-value">${new Date(item.createdAt).toLocaleString('zh-TW')}</span>
        </div>
      </div>
      <div class="data-actions">
        ${canModify(item) ? `
          <button class="btn-delete" onclick="showDeleteModal('${item.id}')">🗑️ 刪除</button>
        ` : ''}
        <span style="font-size: 12px; color: #999; padding: 8px 0;">
          ${currentUser.id === item.ownerId ? '(自己的資料)' : currentUser.role === 'admin' ? '(管理員權限)' : ''}
        </span>
      </div>
    </div>
  `).join('');
}

function canModify(item) {
  return currentUser.id === item.ownerId || currentUser.role === 'admin';
}

function showDeleteModal(id) {
  pendingDeleteId = id;
  deleteModal.classList.add('show');
}

async function confirmDelete() {
  if (!pendingDeleteId) return;

  confirmDeleteBtn.disabled = true;
  confirmDeleteBtn.innerHTML = '<span class="spinner"></span>刪除中...';

  try {
    const response = await fetch(`${API_BASE}/api/signup/${pendingDeleteId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${currentToken}`
      }
    });

    const data = await response.json();

    if (response.status === 401) {
      handleTokenExpired();
      return;
    }

    if (!response.ok) {
      throw new Error(data.error || '刪除失敗');
    }

    showAlert('已刪除', 'success');
    deleteModal.classList.remove('show');
    pendingDeleteId = null;
    loadData();
  } catch (error) {
    showAlert(error.message, 'error');
  } finally {
    confirmDeleteBtn.disabled = false;
    confirmDeleteBtn.innerHTML = '確認刪除';
  }
}

// =====================================
// Token 過期處理
// =====================================
function handleTokenExpired() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  currentToken = null;
  currentUser = null;
  checkAuth();
  showAlert('登入已過期，請重新登入', 'warning');
}

// =====================================
// 輔助函數
// =====================================
function showAlert(message, type = 'error') {
  systemAlert.textContent = message;
  systemAlert.className = `alert show ${type}`;
  setTimeout(() => {
    systemAlert.classList.remove('show');
  }, 5000);
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// 初始化應用
init();
