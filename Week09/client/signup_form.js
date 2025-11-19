const form = document.querySelector('#signup-form');
const resultEl = document.querySelector('#result');
const loadBtn = document.querySelector('#load-list');

async function postSignup(payload) {
  const res = await fetch('http://localhost:3001/api/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || '報名失敗');
  return data;
}

async function fetchList() {
  const res = await fetch('http://localhost:3001/api/signup');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || '取得清單失敗');
  return data;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());
  payload.password = 'demoPass88';
  payload.confirmPassword = 'demoPass88';
  payload.interests = ['後端入門'];
  payload.terms = true;

  try {
    resultEl.textContent = '送出中...';
    form.querySelector('button[type="submit"]').disabled = true;
    const result = await postSignup(payload);
    resultEl.textContent = JSON.stringify(result, null, 2);
    form.reset();
  } catch (err) {
    resultEl.textContent = `錯誤：${err.message}`;
  } finally {
    form.querySelector('button[type="submit"]').disabled = false;
  }
});

loadBtn.addEventListener('click', async () => {
  try {
    loadBtn.disabled = true;
    resultEl.textContent = '載入中...';
    const list = await fetchList();
    resultEl.textContent = JSON.stringify(list, null, 2);
  } catch (err) {
    resultEl.textContent = `錯誤：${err.message}`;
  } finally {
    loadBtn.disabled = false;
  }
});
