const API_BASE_URL = 'http://localhost:3001';

const form = document.getElementById('signupForm');
const submitBtn = document.getElementById('submitBtn');
const loading = document.querySelector('.loading');
const errorAlert = document.querySelector('.error-alert');
const successAlert = document.querySelector('.success-alert');
const participantsList = document.getElementById('participantsList');
const totalCount = document.getElementById('totalCount');

/**
 * 隱藏所有警告訊息
 */
function hideAlerts() {
  errorAlert.style.display = 'none';
  successAlert.style.display = 'none';
}

/**
 * 顯示錯誤訊息
 */
function showError(message) {
  hideAlerts();
  document.querySelector('.error-text').textContent = message;
  errorAlert.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * 顯示成功訊息
 */
function showSuccess(message) {
  hideAlerts();
  document.querySelector('.success-text').textContent = message;
  successAlert.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * 設定提交按鈕狀態
 */
function setSubmitLoading(isLoading) {
  submitBtn.disabled = isLoading;
  if (isLoading) {
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>送出中...';
    loading.style.display = 'block';
  } else {
    submitBtn.textContent = '送出報名';
    loading.style.display = 'none';
  }
}

/**
 * 取得選取的興趣
 */
function getSelectedInterests() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
  return Array.from(checkboxes).map(cb => cb.value);
}

/**
 * 送出表單
 */
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideAlerts();

  const formData = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    interests: getSelectedInterests(),
    status: 'pending'
  };

  // 基本驗證
  if (!formData.name || !formData.email || !formData.phone) {
    showError('請填入所有必填欄位');
    return;
  }

  setSubmitLoading(true);

  try {
    const response = await fetch(`${API_BASE_URL}/api/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '送出失敗');
    }

    showSuccess(`報名成功！歡迎 ${formData.name}`);
    form.reset();
    loadParticipants();
  } catch (error) {
    showError(error.message || '送出失敗，請稍後重試');
  } finally {
    setSubmitLoading(false);
  }
});

/**
 * 載入報名清單
 */
async function loadParticipants() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/signup?page=1&limit=100`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error('載入清單失敗');
    }

    totalCount.textContent = data.pagination.total;
    participantsList.innerHTML = '';

    if (data.items.length === 0) {
      participantsList.innerHTML = '<p class="text-muted">目前還沒有人報名</p>';
      return;
    }

    data.items.forEach((participant) => {
      const createdDate = new Date(participant.createdAt).toLocaleString('zh-TW');
      const interests = (participant.interests || []).join('、') || '無';
      const statusBadgeClass =
        participant.status === 'approved'
          ? 'bg-success'
          : participant.status === 'rejected'
          ? 'bg-danger'
          : 'bg-warning';

      const card = document.createElement('div');
      card.className = 'participant-card';
      card.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <h5 class="mb-1">${escapeHtml(participant.name)}</h5>
            <p class="mb-2"><small class="text-muted">${participant.email}</small></p>
            <p class="mb-2"><small><strong>手機：</strong> ${escapeHtml(participant.phone)}</small></p>
            <p class="mb-2"><small><strong>興趣：</strong> ${escapeHtml(interests)}</small></p>
            <p class="mb-0"><small class="text-muted">報名時間：${createdDate}</small></p>
          </div>
          <span class="badge ${statusBadgeClass} status-badge">${participant.status}</span>
        </div>
      `;
      participantsList.appendChild(card);
    });
  } catch (error) {
    console.error('載入清單失敗:', error);
    participantsList.innerHTML = '<p class="text-danger">無法載入清單</p>';
  }
}

/**
 * 安全的 HTML 轉義
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 初始化
 */
function init() {
  loadParticipants();
  // 每 5 秒自動刷新清單
  setInterval(loadParticipants, 5000);
}

// 頁面載入完成時初始化
window.addEventListener('load', init);
