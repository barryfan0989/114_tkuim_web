// example1_script.js
// 統一在父層監聽點擊與送出事件，處理清單項目新增/刪除

const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const value = input.value.trim();
  if (!value) {
    return;
  }
  const item = document.createElement('li');
  item.className = 'list-group-item d-flex justify-content-between align-items-center';
  // 新增「完成」按鈕（data-action="toggle"）與刪除按鈕
  item.innerHTML = `
    ${value}
    <span class="btn-group btn-group-sm" role="group">
      <button class="btn btn-sm btn-outline-success" data-action="toggle">完成</button>
      <button class="btn btn-sm btn-outline-danger" data-action="remove">刪除</button>
    </span>
  `;
  list.appendChild(item);
  input.value = '';
  input.focus();
});

// 事件委派：處理完成 / 刪除
list.addEventListener('click', (event) => {
  const btn = event.target.closest('button[data-action]');
  if (!btn) return;
  const action = btn.getAttribute('data-action');
  const item = btn.closest('li');
  if (!item) return;

  if (action === 'remove') {
    item.remove();
    return;
  }

  if (action === 'toggle') {
    const done = item.classList.toggle('list-group-item-success');
    // 切換按鈕文字與樣式，讓狀態更明顯
    btn.textContent = done ? '取消' : '完成';
    if (done) {
      btn.classList.remove('btn-outline-success');
      btn.classList.add('btn-success');
    } else {
      btn.classList.remove('btn-success');
      btn.classList.add('btn-outline-success');
    }
  }
});

// 監聽 input 的 keyup，按 Enter 送出表單
input.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    // 以 dispatchEvent 觸發 submit 事件，會走到上面的 submit handler
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  }
});
