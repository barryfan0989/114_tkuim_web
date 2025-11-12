// ====== 資料 ======
const events = [
  { id:1, title:'City Pop Night',     artist:'Miki Duo',  city:'Taipei',  venue:'小巨蛋',     date:'2025-12-20', price:3200, img:'assets/12.jpg', desc:'復古 City Pop 之夜，與你一起搖擺。' },
  { id:2, title:'Rock the Harbor',    artist:'The Dock',  city:'Keelung', venue:'海洋廣場',   date:'2025-11-30', price:1800, img:'assets/13.jpg', desc:'港邊搖滾派對，浪花與吉他的大合奏。' },
  { id:3, title:'Lo-fi Study Beats',  artist:'Cafe Loop', city:'Tamsui',  venue:'河岸舞台',   date:'2026-01-05', price:1200, img:'assets/14.jpg', desc:'期末讀書配樂現場，超 Chill。' },
  { id:4, title:'EDM Countdown',      artist:'Pulse 114', city:'Taoyuan', venue:'國際棒球場', date:'2025-12-31', price:4200, img:'assets/15.jpg', desc:'跨年電音嘉年華，一起倒數！' },
];

// ====== DOM 快捷 ======
const $  = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

// ====== 深色模式切換（localStorage 記住） ======
const themeToggle = $('#themeToggle');
const applyTheme  = (mode) => document.documentElement.setAttribute('data-theme', mode);
const savedTheme  = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme);
if (themeToggle) themeToggle.checked = savedTheme === 'dark';

themeToggle?.addEventListener('change', () => {
  const mode = themeToggle.checked ? 'dark' : 'light';
  applyTheme(mode);
  localStorage.setItem('theme', mode);
});

// ====== 篩選 / 搜尋 / 排序 元件 ======
const citySel   = $('#city');
const search    = $('#search');
const sortSel   = $('#sort');
const resetBtn  = $('#resetFilters');

// ====== 卡片容器 ======
const cards = $('#cards');

// ====== 最愛（localStorage） ======
const FAV_KEY = 'concert-fav-ids';
const getFavs = () => JSON.parse(localStorage.getItem(FAV_KEY) || '[]');
const isFav   = (id) => getFavs().includes(id);
function toggleFav(id){
  const favs = new Set(getFavs());
  favs.has(id) ? favs.delete(id) : favs.add(id);
  localStorage.setItem(FAV_KEY, JSON.stringify([...favs]));
}

// ====== 渲染：城市選單 ======
if (citySel) {
  [...new Set(events.map(e => e.city))].forEach(c => {
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    citySel.appendChild(opt);
  });
}

// ====== 渲染：活動卡片 ======
function render(list){
  if (!cards) return;
  cards.innerHTML = '';
  list.forEach(e => {
    const col = document.createElement('div');
    col.className = 'col-12 col-sm-6 col-lg-4';

    const inFav = isFav(e.id);

    col.innerHTML = `
      <div class="card h-100">
        <img src="${e.img}" class="card-img-top" alt="${e.title}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${e.title}</h5>
          <p class="card-text text-secondary mb-1">${e.artist} · <span class="badge rounded-pill text-bg-light">${e.city}</span></p>
          <p class="mb-2"><span class="badge badge-soft me-2">${e.venue}</span> <span class="text-nowrap">${e.date}</span></p>
          <p class="fw-semibold mb-3">NT$ ${e.price.toLocaleString()}</p>
          <div class="mt-auto d-grid gap-2">
            <button class="btn btn-outline-primary" data-action="detail" data-id="${e.id}">查看詳情</button>
            <button class="btn ${inFav ? 'btn-danger' : 'btn-outline-danger'}" data-action="fav" data-id="${e.id}">
              ${inFav ? '移除最愛' : '加入最愛'}
            </button>
          </div>
        </div>
      </div>`;
    cards.appendChild(col);
  });
}

// ====== 篩選 + 搜尋 + 排序 ======
function applyFilters(){
  const kw = (search?.value || '').trim().toLowerCase();
  const c  = citySel?.value || '';
  const s  = sortSel?.value || 'dateAsc';

  let list = events.filter(e =>
    (!c || e.city === c) &&
    (!kw || [e.title, e.artist, e.city, e.venue].join(' ').toLowerCase().includes(kw))
  );

  const byDate  = (a,b) => new Date(a.date) - new Date(b.date);
  const byPrice = (a,b) => a.price - b.price;

  if (s === 'dateAsc')  list.sort(byDate);
  if (s === 'dateDesc') list.sort((a,b) => byDate(b,a));
  if (s === 'priceAsc') list.sort(byPrice);
  if (s === 'priceDesc')list.sort((a,b) => byPrice(b,a));

  return list;
}

['input','change'].forEach(ev => {
  [search, citySel, sortSel].forEach(el => el?.addEventListener(ev, () => {
    render(applyFilters());
  }));
});

resetBtn?.addEventListener('click', () => {
  if (search)  search.value = '';
  if (citySel) citySel.value = '';
  if (sortSel) sortSel.value = 'dateAsc';
  render(applyFilters());
});

// ====== 詳情 / 最愛：事件委派 ======
cards?.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const action = btn.dataset.action;
  const item = events.find(x => x.id === id);
  if (!item) return;

  if (action === 'detail') {
    const modalEl = $('#detailModal');
    if (!modalEl) return;
    $('.modal-title', modalEl).textContent = item.title;
    $('#mImg', modalEl).src = item.img;
    $('#mDesc', modalEl).textContent = item.desc;
    $('#mMeta', modalEl).textContent = `${item.city} · ${item.venue} · ${item.date} · NT$ ${item.price.toLocaleString()}`;
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }

  if (action === 'fav') {
    toggleFav(id);
    render(applyFilters());
  }
});

// ====== 預算試算（即時計算） ======
const price          = $('#ticketPrice');
const qty            = $('#ticketQty');
const fee            = $('#serviceFee');
const totalOut       = $('#total');
const saveBudgetBtn  = $('#saveBudget');
const clearBudgetBtn = $('#clearBudget');

// 較穩健的轉數字（處理全形／貼上字元）
const toNum = (v) => {
  const s = String(v ?? '');
  const half = s.replace(/[０-９]/g, d => '0123456789'['０１２３４５６７８９'.indexOf(d)]);
  const clean = half.replace(/[^\d.]/g,'');
  return Number(clean) || 0;
};

function calcTotal(){
  const p = toNum(price?.value);
  const q = toNum(qty?.value);
  const f = toNum(fee?.value);
  const total = p*q + f*q; // 單價×張數 + 手續費×張數
  if (totalOut) totalOut.textContent = `NT$ ${total.toLocaleString()}`;
  return total;
}

// 輸入就重算
['input','change'].forEach(ev => {
  [price, qty, fee].forEach(el => el?.addEventListener(ev, calcTotal));
});

// 儲存預算
saveBudgetBtn?.addEventListener('click', () => {
  const total = calcTotal();
  if (total <= 0) {
    [price, qty, fee].forEach(el => el?.classList.add('is-invalid'));
    return;
  }
  const budgets = JSON.parse(localStorage.getItem('budgets') || '[]');
  budgets.push({ total, at: new Date().toISOString() });
  localStorage.setItem('budgets', JSON.stringify(budgets));
  alert('已儲存到最愛預算！');
});

// 清除
clearBudgetBtn?.addEventListener('click', () => {
  [price, qty, fee].forEach(el => {
    if (!el) return;
    el.value = '';
    el.classList.remove('is-invalid');
  });
  calcTotal();
});

// 頁面載入就先渲染/計算一次（處理自動填入/貼上）
document.addEventListener('DOMContentLoaded', () => {
  render(applyFilters());
  calcTotal();
});

// ====== 表單驗證（Constraint API + 自訂訊息） ======
const subForm    = $('#subForm');
const agree      = $('#agree');
const agreeError = $('#agreeError');

subForm?.addEventListener('submit', (e) => {
  if (!agree?.checked) {
    if (agreeError) agreeError.hidden = false;
  } else {
    if (agreeError) agreeError.hidden = true;
  }

  if (!subForm.checkValidity()) {
    e.preventDefault();
    e.stopPropagation();
  } else {
    e.preventDefault();
    const payload = {
      email: $('#email')?.value,
      // 注意：示範用途，正式環境不要存純文字密碼
      registeredAt: new Date().toISOString()
    };
    localStorage.setItem('subscribed', JSON.stringify(payload));
    alert('訂閱成功！我們會在開賣時通知您。');
    subForm.reset();
  }
  subForm.classList.add('was-validated');
});

agree?.addEventListener('input', () => { if (agreeError) agreeError.hidden = agree.checked; });

// 即時提示：密碼 pattern 失敗時加入 is-invalid
$('#password')?.addEventListener('input', (ev) => {
  ev.target.classList.toggle('is-invalid', !ev.target.checkValidity());
});

