// API 基礎設定
const API_BASE_URL = 'http://localhost:3001';

// 狀態管理
let currentTasks = [];
let currentFilters = {
  status: '',
  priority: '',
  search: ''
};
let editingTaskId = null;

// 工具函數：取得 token
function getToken() {
  return localStorage.getItem('token');
}

// 工具函數：取得使用者資訊
function getUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// 工具函數：登出
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// 工具函數：API 請求
async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers
    }
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // 認證失效或無效，自動登出並提示
        logout();
        throw new Error(data.error || '認證失效，請重新登入');
      }
      throw new Error(data.error || '請求失敗');
    }
    
    return data;
  } catch (error) {
    console.error('API 錯誤:', error);
    throw error;
  }
}

// 初始化頁面
async function init() {
  // 檢查認證
  const token = getToken();
  if (!token) {
    window.location.href = 'login.html';
    return;
  }
  
  // 顯示使用者名稱
  const user = getUser();
  if (user) {
    document.getElementById('userName').textContent = user.username;
  }
  
  // 設定事件監聽器
  setupEventListeners();
  
  // 載入資料
  await Promise.all([
    loadStatistics(),
    loadTasks()
  ]);
}

// 設定事件監聽器
function setupEventListeners() {
  // 登出按鈕
  document.getElementById('logoutBtn').addEventListener('click', logout);
  
  // 新增任務按鈕
  document.getElementById('addTaskBtn').addEventListener('click', openAddModal);
  
  // Modal 關閉按鈕
  document.getElementById('closeModal').addEventListener('click', closeTaskModal);
  document.getElementById('cancelBtn').addEventListener('click', closeTaskModal);
  
  // 任務表單提交
  document.getElementById('taskForm').addEventListener('submit', handleTaskSubmit);
  
  // 刪除 Modal
  document.getElementById('closeDeleteModal').addEventListener('click', closeDeleteModal);
  document.getElementById('cancelDeleteBtn').addEventListener('click', closeDeleteModal);
  document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);
  
  // 過濾器
  document.getElementById('filterStatus').addEventListener('change', handleFilterChange);
  document.getElementById('filterPriority').addEventListener('change', handleFilterChange);
  
  // 搜尋（使用 debounce）
  let searchTimeout;
  document.getElementById('searchInput').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentFilters.search = e.target.value;
      loadTasks();
    }, 500);
  });
  
  // 點擊 Modal 外部關閉
  window.addEventListener('click', (e) => {
    const taskModal = document.getElementById('taskModal');
    const deleteModal = document.getElementById('deleteModal');
    
    if (e.target === taskModal) {
      closeTaskModal();
    }
    if (e.target === deleteModal) {
      closeDeleteModal();
    }
  });
}

// 載入統計資料
async function loadStatistics() {
  try {
    const stats = await apiRequest('/api/tasks/statistics');
    
    document.getElementById('statTotal').textContent = stats.total;
    document.getElementById('statTodo').textContent = stats.todo;
    document.getElementById('statInProgress').textContent = stats.inProgress;
    document.getElementById('statCompleted').textContent = stats.completed;
  } catch (error) {
    console.error('載入統計失敗:', error);
  }
}

// 載入任務列表
async function loadTasks() {
  const tasksList = document.getElementById('tasksList');
  const loadingState = document.getElementById('loadingState');
  const emptyState = document.getElementById('emptyState');
  
  loadingState.style.display = 'block';
  tasksList.innerHTML = '';
  emptyState.style.display = 'none';
  
  try {
    const params = new URLSearchParams();
    if (currentFilters.status) params.append('status', currentFilters.status);
    if (currentFilters.priority) params.append('priority', currentFilters.priority);
    if (currentFilters.search) params.append('search', currentFilters.search);
    
    const data = await apiRequest(`/api/tasks?${params.toString()}`);
    currentTasks = data.tasks;
    
    loadingState.style.display = 'none';
    
    if (currentTasks.length === 0) {
      emptyState.style.display = 'block';
    } else {
      renderTasks(currentTasks);
    }
  } catch (error) {
    loadingState.style.display = 'none';
    console.error('載入任務失敗:', error);
    alert('載入任務失敗：' + error.message);
  }
}

// 渲染任務列表
function renderTasks(tasks) {
  const tasksList = document.getElementById('tasksList');
  
  tasksList.innerHTML = tasks.map(task => `
    <div class="task-card ${task.status}" data-task-id="${task._id}">
      <div class="task-header">
        <div class="task-info">
          <h3 class="task-title">${escapeHtml(task.title)}</h3>
          <div class="task-meta">
            <span class="task-badge status-${task.status}">
              ${getStatusText(task.status)}
            </span>
            <span class="task-badge priority-${task.priority}">
              ${getPriorityIcon(task.priority)} ${getPriorityText(task.priority)}
            </span>
            ${task.dueDate ? `
              <span class="task-date ${isPastDue(task.dueDate) ? 'overdue' : ''}">
                📅 ${formatDate(task.dueDate)}
              </span>
            ` : ''}
          </div>
        </div>
        <div class="task-actions">
          <button class="btn-icon" onclick="openEditModal('${task._id}')" title="編輯">
            ✏️
          </button>
          <button class="btn-icon" onclick="openDeleteModal('${task._id}')" title="刪除">
            🗑️
          </button>
        </div>
      </div>
      ${task.description ? `
        <p class="task-description">${escapeHtml(task.description)}</p>
      ` : ''}
      <div class="task-footer">
        <span class="task-time">建立於 ${formatDate(task.createdAt)}</span>
      </div>
    </div>
  `).join('');
}

// 過濾器變更處理
function handleFilterChange() {
  currentFilters.status = document.getElementById('filterStatus').value;
  currentFilters.priority = document.getElementById('filterPriority').value;
  loadTasks();
}

// 開啟新增 Modal
function openAddModal() {
  editingTaskId = null;
  document.getElementById('modalTitle').textContent = '新增任務';
  document.getElementById('taskForm').reset();
  document.getElementById('taskId').value = '';
  document.getElementById('taskStatus').value = 'todo';
  document.getElementById('taskPriority').value = 'medium';
  document.getElementById('taskModal').style.display = 'flex';
}

// 開啟編輯 Modal
async function openEditModal(taskId) {
  editingTaskId = taskId;
  document.getElementById('modalTitle').textContent = '編輯任務';
  
  try {
    const task = await apiRequest(`/api/tasks/${taskId}`);
    
    document.getElementById('taskId').value = task._id;
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description || '';
    document.getElementById('taskStatus').value = task.status;
    document.getElementById('taskPriority').value = task.priority;
    
    if (task.dueDate) {
      const date = new Date(task.dueDate);
      document.getElementById('taskDueDate').value = date.toISOString().slice(0, 16);
    } else {
      document.getElementById('taskDueDate').value = '';
    }
    
    document.getElementById('taskModal').style.display = 'flex';
  } catch (error) {
    alert('載入任務失敗：' + error.message);
  }
}

// 關閉任務 Modal
function closeTaskModal() {
  document.getElementById('taskModal').style.display = 'none';
  document.getElementById('taskForm').reset();
  editingTaskId = null;
}

// 處理任務表單提交
async function handleTaskSubmit(e) {
  e.preventDefault();
  
  const saveBtn = document.getElementById('saveTaskBtn');
  saveBtn.disabled = true;
  saveBtn.textContent = '儲存中...';
  
  const formData = {
    title: document.getElementById('taskTitle').value,
    description: document.getElementById('taskDescription').value,
    status: document.getElementById('taskStatus').value,
    priority: document.getElementById('taskPriority').value,
    dueDate: document.getElementById('taskDueDate').value || null
  };
  
  try {
    if (editingTaskId) {
      // 更新任務
      await apiRequest(`/api/tasks/${editingTaskId}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
    } else {
      // 新增任務
      await apiRequest('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
    }
    
    closeTaskModal();
    await Promise.all([
      loadStatistics(),
      loadTasks()
    ]);
  } catch (error) {
    alert('儲存失敗：' + error.message);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = '儲存';
  }
}

// 開啟刪除確認 Modal
function openDeleteModal(taskId) {
  editingTaskId = taskId;
  document.getElementById('deleteModal').style.display = 'flex';
}

// 關閉刪除 Modal
function closeDeleteModal() {
  document.getElementById('deleteModal').style.display = 'none';
  editingTaskId = null;
}

// 確認刪除
async function confirmDelete() {
  if (!editingTaskId) return;
  
  const confirmBtn = document.getElementById('confirmDeleteBtn');
  confirmBtn.disabled = true;
  confirmBtn.textContent = '刪除中...';
  
  try {
    await apiRequest(`/api/tasks/${editingTaskId}`, {
      method: 'DELETE'
    });
    
    closeDeleteModal();
    await Promise.all([
      loadStatistics(),
      loadTasks()
    ]);
  } catch (error) {
    alert('刪除失敗：' + error.message);
  } finally {
    confirmBtn.disabled = false;
    confirmBtn.textContent = '確認刪除';
  }
}

// 工具函數：HTML 轉義
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 工具函數：格式化日期
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = date - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return '今天';
  if (days === 1) return '明天';
  if (days === -1) return '昨天';
  if (days > 0 && days <= 7) return `${days} 天後`;
  if (days < 0 && days >= -7) return `${Math.abs(days)} 天前`;
  
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

// 工具函數：檢查是否過期
function isPastDue(dateString) {
  return new Date(dateString) < new Date();
}

// 工具函數：取得狀態文字
function getStatusText(status) {
  const statusMap = {
    'todo': '待處理',
    'inProgress': '進行中',
    'completed': '已完成'
  };
  return statusMap[status] || status;
}

// 工具函數：取得優先級文字
function getPriorityText(priority) {
  const priorityMap = {
    'low': '低',
    'medium': '中',
    'high': '高'
  };
  return priorityMap[priority] || priority;
}

// 工具函數：取得優先級圖示
function getPriorityIcon(priority) {
  const iconMap = {
    'low': '🟢',
    'medium': '🟡',
    'high': '🔴'
  };
  return iconMap[priority] || '⚪';
}

// 頁面載入時初始化
document.addEventListener('DOMContentLoaded', init);
