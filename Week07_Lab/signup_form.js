// 即時驗證、事件委派、localStorage、送出攔截、密碼強度

(function () {
  const form = document.getElementById('signup-form');
  const nameEl = document.getElementById('name');
  const emailEl = document.getElementById('email');
  const mobileEl = document.getElementById('mobile');
  const passwordEl = document.getElementById('password');
  const confirmEl = document.getElementById('confirm');
  const interestsEl = document.getElementById('interests');
  const interestsError = document.getElementById('interests-error');
  const agreeEl = document.getElementById('agree');
  const submitBtn = document.getElementById('submit-btn');
  const resetBtn = document.getElementById('reset-btn');
  const strengthContainer = document.getElementById('password-strength');
  const strengthText = document.getElementById('password-strength-text');

  const STORAGE_KEY = 'week07_signup_draft_v1';

  // helper: 顯示自訂錯誤到 <p> 並 setCustomValidity
  function setFieldError(input, message) {
    const err = document.getElementById(input.id + '-error');
    if (message) {
      input.classList.add('is-invalid');
      input.setCustomValidity(message);
      if (err) err.textContent = message;
    } else {
      input.classList.remove('is-invalid');
      input.setCustomValidity('');
      if (err) err.textContent = '';
    }
  }

  // 驗證規則
  function validateName() {
    const v = nameEl.value.trim();
    if (!v) {
      setFieldError(nameEl, '請輸入姓名');
      return false;
    }
    setFieldError(nameEl, '');
    return true;
  }

  function validateEmail() {
    const v = emailEl.value.trim();
    if (!v) {
      setFieldError(emailEl, '請輸入 Email');
      return false;
    }
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(v)) {
      setFieldError(emailEl, 'Email 格式錯誤');
      return false;
    }
    setFieldError(emailEl, '');
    return true;
  }

  function validateMobile() {
    const v = mobileEl.value.trim();
    if (!v) {
      setFieldError(mobileEl, '請輸入手機號碼');
      return false;
    }
    const re = /^\d{10}$/;
    if (!re.test(v)) {
      setFieldError(mobileEl, '請輸入 10 碼數字（例：0912345678）');
      return false;
    }
    setFieldError(mobileEl, '');
    return true;
  }

  function validatePassword() {
    const v = passwordEl.value;
    if (!v) {
      setFieldError(passwordEl, '請輸入密碼');
      updatePasswordStrength(v);
      return false;
    }
    const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!re.test(v)) {
      setFieldError(passwordEl, '密碼需至少 8 碼且含英文字母與數字');
      updatePasswordStrength(v);
      return false;
    }
    setFieldError(passwordEl, '');
    updatePasswordStrength(v);
    return true;
  }

  function validateConfirm() {
    const v = confirmEl.value;
    if (!v) {
      setFieldError(confirmEl, '請再次輸入密碼');
      return false;
    }
    if (v !== passwordEl.value) {
      setFieldError(confirmEl, '與密碼不一致');
      return false;
    }
    setFieldError(confirmEl, '');
    return true;
  }

  function validateInterests() {
    const checked = interestsEl.querySelectorAll('input[type="checkbox"]:checked').length;
    if (checked === 0) {
      interestsError.textContent = '請至少選擇一個興趣';
      interestsEl.classList.add('is-invalid');
      return false;
    }
    interestsError.textContent = '';
    interestsEl.classList.remove('is-invalid');
    return true;
  }

  function validateAgree() {
    if (!agreeEl.checked) {
      document.getElementById('agree-error').textContent = '需同意服務條款';
      return false;
    }
    document.getElementById('agree-error').textContent = '';
    return true;
  }

  // 密碼強度：簡單判斷（長度 + 類型）
  function updatePasswordStrength(pwd) {
    const el = strengthContainer;
    el.classList.remove('weak', 'medium', 'strong');
    if (!pwd) {
      strengthText.textContent = '強度： -';
      return;
    }
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd) || /[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++; // 符號加分

    if (score <= 1) {
      el.classList.add('weak');
      strengthText.textContent = '強度：弱';
    } else if (score === 2 || score === 3) {
      el.classList.add('medium');
      strengthText.textContent = '強度：中';
    } else {
      el.classList.add('strong');
      strengthText.textContent = '強度：強';
    }
  }

  // interest 父層委派：切換 label.active 與 checkbox 狀態
  interestsEl.addEventListener('click', (e) => {
    const label = e.target.closest('label');
    if (!label) return;
    const cb = label.querySelector('input[type="checkbox"]');
    if (!cb) return;
    cb.checked = !cb.checked;
    label.classList.toggle('active', cb.checked);
    validateInterests();
    saveDraft();
  });

  // input / blur 事件：即時驗證與 localStorage
  [nameEl, emailEl, mobileEl, passwordEl, confirmEl].forEach((input) => {
    input.addEventListener('input', () => {
      if (input.classList.contains('is-invalid')) {
        switch (input) {
          case nameEl: validateName(); break;
          case emailEl: validateEmail(); break;
          case mobileEl: validateMobile(); break;
          case passwordEl: validatePassword(); validateConfirm(); break;
          case confirmEl: validateConfirm(); break;
        }
      }
      if (input === passwordEl) updatePasswordStrength(passwordEl.value);
      if (input === passwordEl || input === confirmEl) validateConfirm();
      saveDraft();
    });

    input.addEventListener('blur', () => {
      switch (input) {
        case nameEl: validateName(); break;
        case emailEl: validateEmail(); break;
        case mobileEl: validateMobile(); break;
        case passwordEl: validatePassword(); break;
        case confirmEl: validateConfirm(); break;
      }
    });
  });

  function syncInterestLabels() {
    interestsEl.querySelectorAll('label').forEach((label) => {
      const cb = label.querySelector('input[type="checkbox"]');
      label.classList.toggle('active', !!cb && cb.checked);
    });
  }

  // localStorage：儲存與載入草稿
  function saveDraft() {
    try {
      const data = {
        name: nameEl.value,
        email: emailEl.value,
        mobile: mobileEl.value,
        password: passwordEl.value,
        confirm: confirmEl.value,
        interests: Array.from(interestsEl.querySelectorAll('input[type="checkbox"]')).map(cb => cb.checked),
        agree: agreeEl.checked
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) { /* ignore */ }
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!data) return;
      nameEl.value = data.name || '';
      emailEl.value = data.email || '';
      mobileEl.value = data.mobile || '';
      passwordEl.value = data.password || '';
      confirmEl.value = data.confirm || '';
      const cbs = interestsEl.querySelectorAll('input[type="checkbox"]');
      cbs.forEach((cb, idx) => { cb.checked = !!(data.interests && data.interests[idx]); });
      agreeEl.checked = !!data.agree;
      syncInterestLabels();
      updatePasswordStrength(passwordEl.value);
    } catch (e) { /* ignore */ }
  }

  // 重設：清除錯誤與 localStorage、強度條
  resetBtn.addEventListener('click', () => {
    form.reset();
    [nameEl, emailEl, mobileEl, passwordEl, confirmEl].forEach(i => setFieldError(i, ''));
    interestsError.textContent = '';
    interestsEl.classList.remove('is-invalid');
    syncInterestLabels();
    updatePasswordStrength('');
    localStorage.removeItem(STORAGE_KEY);
  });

  // submit：檢查所有欄位並聚焦第一個錯誤，模擬送出並防重送
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const okName = validateName();
    const okEmail = validateEmail();
    const okMobile = validateMobile();
    const okPassword = validatePassword();
    const okConfirm = validateConfirm();
    const okInterests = validateInterests();
    const okAgree = validateAgree();

    if (!(okName && okEmail && okMobile && okPassword && okConfirm && okInterests && okAgree)) {
      const firstInvalid = form.querySelector('.is-invalid, input:invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    submitBtn.textContent = '送出中...';

    await new Promise(resolve => setTimeout(resolve, 1000));

    alert('註冊成功！（示範）');

    localStorage.removeItem(STORAGE_KEY);
    form.reset();
    updatePasswordStrength('');
    syncInterestLabels();
    submitBtn.disabled = false;
    submitBtn.classList.remove('loading');
    submitBtn.textContent = '註冊';
  });

  // init
  loadDraft();
  syncInterestLabels();

  interestsEl.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', saveDraft);
  });

  interestsEl.addEventListener('keydown', (e) => {
    const label = e.target.closest('label');
    if (!label) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      const cb = label.querySelector('input[type="checkbox"]');
      if (cb) {
        cb.checked = !cb.checked;
        label.classList.toggle('active', cb.checked);
        saveDraft();
        validateInterests();
      }
    }
  });
})();