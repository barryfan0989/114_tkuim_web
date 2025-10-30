// practice6_dynamic_fields.js
// 動態新增報名欄位並整合事件委派、即時驗證、送出攔截、localStorage 與匯出功能

const form = document.getElementById('dynamic-form');
const list = document.getElementById('participant-list');
const addBtn = document.getElementById('add-participant');
const submitBtn = document.getElementById('submit-btn');
const resetBtn = document.getElementById('reset-btn');
const countLabel = document.getElementById('count');

const maxParticipants = 5;
let participantIndex = 0;
const STORAGE_KEY = 'dynamic_participants_v1';

// 若頁面沒有匯出按鈕，自動建立一個並放在 addBtn 旁
let exportBtn = document.getElementById('export-btn');
if (!exportBtn && addBtn) {
  exportBtn = document.createElement('button');
  exportBtn.id = 'export-btn';
  exportBtn.type = 'button';
  exportBtn.className = 'btn btn-secondary btn-sm ms-2';
  exportBtn.textContent = '匯出名單';
  addBtn.insertAdjacentElement('afterend', exportBtn);
}

// 簡單 CSS 強化不合法欄位外框（Bootstrap 已有 is-invalid，但補強）
(function injectStyle() {
  const style = document.createElement('style');
  style.textContent = `
    .is-invalid {
      outline: 2px solid rgba(220,53,69,0.15) !important;
      box-shadow: 0 0 0 0.15rem rgba(220,53,69,0.075) !important;
    }
  `;
  document.head.appendChild(style);
})();

function createParticipantCard() {
  const index = participantIndex++;
  const wrapper = document.createElement('div');
  wrapper.className = 'participant card border-0 shadow-sm mb-3';
  wrapper.dataset.index = index;
  wrapper.innerHTML = `
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start mb-3">
        <h5 class="card-title mb-0">參與者 ${index + 1}</h5>
        <button type="button" class="btn btn-sm btn-outline-danger" data-action="remove">移除</button>
      </div>
      <div class="mb-3">
        <label class="form-label" for="name-${index}">姓名</label>
        <input id="name-${index}" name="name-${index}" class="form-control" type="text" required aria-describedby="name-${index}-error">
        <p id="name-${index}-error" class="text-danger small mb-0" aria-live="polite"></p>
      </div>
      <div class="mb-0">
        <label class="form-label" for="email-${index}">Email</label>
        <input id="email-${index}" name="email-${index}" class="form-control" type="email" required aria-describedby="email-${index}-error" inputmode="email">
        <p id="email-${index}-error" class="text-danger small mb-0" aria-live="polite"></p>
      </div>
    </div>
  `;
  return wrapper;
}

function updateCount() {
  countLabel.textContent = list.children.length;
  addBtn.disabled = list.children.length >= maxParticipants;
  // 儲存變更到 localStorage
  saveToStorage();
}

function setError(input, message) {
  const error = document.getElementById(`${input.id}-error`);
  input.setCustomValidity(message);
  error.textContent = message || '';
  if (message) {
    input.classList.add('is-invalid');
  } else {
    input.classList.remove('is-invalid');
  }
}

function validateInput(input) {
  const value = input.value.trim();
  if (!value) {
    setError(input, '此欄位必填');
    return false;
  }
  if (input.type === 'email') {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
      setError(input, 'Email 格式不正確');
      return false;
    }
  }
  setError(input, '');
  return true;
}

function gatherParticipants() {
  const arr = [];
  list.querySelectorAll('.participant').forEach((p) => {
    const nameInput = p.querySelector('input[type="text"]');
    const emailInput = p.querySelector('input[type="email"]');
    arr.push({
      name: nameInput ? nameInput.value.trim() : '',
      email: emailInput ? emailInput.value.trim() : ''
    });
  });
  return arr;
}

function saveToStorage() {
  try {
    const data = gatherParticipants();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // ignore storage errors
  }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr) || arr.length === 0) return false;

    // 清空現有
    list.innerHTML = '';
    participantIndex = 0;
    arr.forEach((p) => {
      const card = createParticipantCard();
      list.appendChild(card);
      const nameInput = card.querySelector('input[type="text"]');
      const emailInput = card.querySelector('input[type="email"]');
      if (nameInput) nameInput.value = p.name || '';
      if (emailInput) emailInput.value = p.email || '';
    });
    updateCount();
    return true;
  } catch (e) {
    return false;
  }
}

function exportList(asJson = true) {
  const data = gatherParticipants();
  if (data.length === 0) {
    alert('目前沒有任何參與者可匯出。');
    return;
  }
  let blob, filename;
  if (asJson) {
    const text = JSON.stringify(data, null, 2);
    blob = new Blob([text], { type: 'application/json' });
    filename = 'participants.json';
  } else {
    const lines = data.map((d, i) => `${i + 1}. ${d.name} <${d.email}>`).join('\n');
    blob = new Blob([lines], { type: 'text/plain' });
    filename = 'participants.txt';
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function handleAddParticipant() {
  if (list.children.length >= maxParticipants) return;
  const participant = createParticipantCard();
  list.appendChild(participant);
  updateCount();
  participant.querySelector('input')?.focus();
  saveToStorage();
}

addBtn.addEventListener('click', handleAddParticipant);

list.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action="remove"]');
  if (!button) return;
  const participant = button.closest('.participant');
  participant?.remove();
  updateCount();
  saveToStorage();
});

// 即時驗證：blur 與 input
list.addEventListener('blur', (event) => {
  if (event.target.matches('input')) {
    validateInput(event.target);
    saveToStorage();
  }
}, true);

list.addEventListener('input', (event) => {
  if (event.target.matches('input')) {
    const wasInvalid = event.target.validationMessage;
    if (wasInvalid) validateInput(event.target);
    saveToStorage();
  }
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (list.children.length === 0) {
    alert('請至少新增一位參與者');
    handleAddParticipant();
    return;
  }

  let firstInvalid = null;
  list.querySelectorAll('input').forEach((input) => {
    const valid = validateInput(input);
    if (!valid && !firstInvalid) firstInvalid = input;
  });

  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = '送出中...';
  await new Promise((resolve) => setTimeout(resolve, 800));
  alert('表單已送出！');

  // 清除與重置
  form.reset();
  list.innerHTML = '';
  participantIndex = 0;
  updateCount();
  localStorage.removeItem(STORAGE_KEY);
  submitBtn.disabled = false;
  submitBtn.textContent = '送出';
});

resetBtn.addEventListener('click', () => {
  form.reset();
  list.innerHTML = '';
  participantIndex = 0;
  updateCount();
  localStorage.removeItem(STORAGE_KEY);
});

// export 按鈕：點一下匯出 JSON，長按或按住 Shift 匯出文字
if (exportBtn) {
  exportBtn.addEventListener('click', (e) => {
    exportList(true);
  });
  exportBtn.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    exportList(false);
  });
  // Shift+click 匯出文字檔
  exportBtn.addEventListener('click', (e) => {
    if (e.shiftKey) {
      exportList(false);
    }
  });
}

// 預設新增一筆（或從 localStorage 還原）
if (!loadFromStorage()) {
  handleAddParticipant();
} else {
  // 若從儲存還原，確保 count 與按鈕狀態正確
  updateCount();
}
