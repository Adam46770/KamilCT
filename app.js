const DEFAULT_ROLES = [
  { name: 'Manager', rate: 120, count: 0 },
  { name: 'Senior',  rate: 100, count: 0 },
  { name: 'Mid',     rate: 70,  count: 0 },
  { name: 'Junior',  rate: 50,  count: 0 }
];

// --- Storage ---

function loadRoles() {
  try {
    const stored = localStorage.getItem('meetingCost:roles');
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return DEFAULT_ROLES.map(r => ({ ...r }));
}

function saveRoles(roles) {
  localStorage.setItem('meetingCost:roles', JSON.stringify(roles));
}

function loadSettings() {
  try {
    const stored = localStorage.getItem('meetingCost:settings');
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return { currency: 'PLN' };
}

function saveSettings(settings) {
  localStorage.setItem('meetingCost:settings', JSON.stringify(settings));
}

// --- Derived values ---

function getTotalParticipants(roles) {
  return roles.reduce((s, r) => s + r.count, 0);
}

function getTotalHourlyRate(roles) {
  return roles.reduce((s, r) => s + r.rate * r.count, 0);
}

// --- Timer state ---

const timer = {
  startTime: null,
  pausedAt: null,
  totalPausedMs: 0,
  isRunning: false
};

function startTimer() {
  timer.startTime = Date.now();
  timer.pausedAt = null;
  timer.totalPausedMs = 0;
  timer.isRunning = true;
}

function pauseTimer() {
  timer.pausedAt = Date.now();
  timer.isRunning = false;
}

function resumeTimer() {
  timer.totalPausedMs += Date.now() - timer.pausedAt;
  timer.pausedAt = null;
  timer.isRunning = true;
}

function resetTimer() {
  timer.startTime = null;
  timer.pausedAt = null;
  timer.totalPausedMs = 0;
  timer.isRunning = false;
}

function getElapsedMs() {
  return Date.now() - timer.startTime - timer.totalPausedMs;
}

// --- Cost calculation ---

function getMeetingCost(roles) {
  return getTotalHourlyRate(roles) * (getElapsedMs() / 3_600_000);
}

// --- Formatting ---

function formatCurrency(amount, currency) {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency }).format(amount);
}

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

// --- Application state ---

let roles = loadRoles();
let settings = loadSettings();
let renderInterval = null;

// --- View switching ---

function showView(id) {
  ['view-main', 'view-active', 'view-settings'].forEach(v => {
    document.getElementById(v).hidden = v !== id;
  });
}

// --- Render: Main view ---

function renderMain() {
  const container = document.getElementById('role-tiles');
  container.innerHTML = '';

  roles.forEach((role, i) => {
    const tile = document.createElement('div');
    tile.className = 'role-tile';
    tile.innerHTML = `
      <span class="role-name">${role.name}</span>
      <span class="role-rate">${role.rate} ${settings.currency}/h</span>
      <div class="role-controls">
        <button class="btn-count" data-i="${i}" data-action="dec">&#8722;</button>
        <span class="role-count">${role.count}</span>
        <button class="btn-count" data-i="${i}" data-action="inc">+</button>
      </div>
    `;
    container.appendChild(tile);
  });

  document.getElementById('total-hourly-rate').textContent =
    formatCurrency(getTotalHourlyRate(roles), settings.currency);
  document.getElementById('btn-start').disabled = getTotalParticipants(roles) === 0;
}

// --- Render: Active Meeting view (called by interval) ---

function render() {
  const elapsed = getElapsedMs();
  document.getElementById('meeting-cost').textContent =
    formatCurrency(getMeetingCost(roles), settings.currency);
  document.getElementById('elapsed-time').textContent = formatTime(elapsed);
  document.getElementById('participant-count').textContent = getTotalParticipants(roles);
  document.getElementById('active-hourly-rate').textContent =
    formatCurrency(getTotalHourlyRate(roles), settings.currency);
}

// --- Render: Settings view ---

function renderSettings() {
  const container = document.getElementById('settings-roles');
  container.innerHTML = '';

  roles.forEach((role, i) => {
    const row = document.createElement('div');
    row.className = 'settings-role-row';
    row.innerHTML = `
      <input type="text" data-i="${i}" data-field="name" value="${role.name}" placeholder="Rola">
      <input type="number" data-i="${i}" data-field="rate" value="${role.rate}" min="1" placeholder="Stawka/h">
    `;
    container.appendChild(row);
  });

  document.getElementById('currency-select').value = settings.currency;
}

// --- Event handlers ---

document.getElementById('role-tiles').addEventListener('click', e => {
  const btn = e.target.closest('.btn-count');
  if (!btn) return;
  const i = Number(btn.dataset.i);
  if (btn.dataset.action === 'inc') {
    roles[i].count += 1;
  } else if (roles[i].count > 0) {
    roles[i].count -= 1;
  }
  saveRoles(roles);
  renderMain();
});

document.getElementById('btn-start').addEventListener('click', () => {
  startTimer();
  showView('view-active');
  document.getElementById('btn-pause').textContent = 'Pause';
  render();
  renderInterval = setInterval(render, 250);
});

document.getElementById('btn-pause').addEventListener('click', () => {
  const btn = document.getElementById('btn-pause');
  if (timer.isRunning) {
    pauseTimer();
    btn.textContent = 'Resume';
  } else {
    resumeTimer();
    btn.textContent = 'Pause';
  }
});

document.getElementById('btn-reset').addEventListener('click', () => {
  clearInterval(renderInterval);
  renderInterval = null;
  resetTimer();
  showView('view-main');
  renderMain();
});

document.getElementById('btn-settings').addEventListener('click', () => {
  renderSettings();
  showView('view-settings');
});

document.getElementById('btn-settings-save').addEventListener('click', () => {
  const nameInputs = document.querySelectorAll('#settings-roles input[data-field="name"]');
  const rateInputs = document.querySelectorAll('#settings-roles input[data-field="rate"]');

  nameInputs.forEach((input, i) => {
    const trimmed = input.value.trim();
    if (trimmed) roles[i].name = trimmed;
  });
  rateInputs.forEach((input, i) => {
    const val = parseFloat(input.value);
    if (val > 0) roles[i].rate = val;
  });

  settings.currency = document.getElementById('currency-select').value;
  saveRoles(roles);
  saveSettings(settings);
  showView('view-main');
  renderMain();
});

document.getElementById('btn-settings-cancel').addEventListener('click', () => {
  showView('view-main');
});

// --- Init ---

renderMain();
