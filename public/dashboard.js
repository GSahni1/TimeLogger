const habitList = document.getElementById('habitList');
const logList = document.getElementById('logList');
const logTitle = document.getElementById('logTitle');
const logoutBtn = document.getElementById('logoutBtn');

const changeTzBtn = document.getElementById('changeTzBtn');
const tzModal = document.getElementById('tzModal');
const tzBackdrop = document.getElementById('tzModalBackdrop');
const tzCard = document.getElementById('tzModalCard');
const tzSelect = document.getElementById('tzSelect');
const tzSearch = document.getElementById('tzSearch');
const tzSaveBtn = document.getElementById('tzSaveBtn');
const tzCancelBtn = document.getElementById('tzCancelBtn');


logoutBtn.onclick = async () => {
  try {
    await fetch('/logout', {
      method: 'POST',
      credentials: 'include'
    });
  } catch(err){
    console.error('Logout failed', err);
  }finally {
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  }
};
const addHabitBtn = document.getElementById('addHabitBtn');

addHabitBtn.onclick = async () => {
  const title = prompt('Habit name:');
  if (!title) return;

  const description = prompt('Habit description (optional):') || '';

  try {
    await createHabit(title, description);
    await renderHabits();
  } catch (err) {
    alert(err.message);
  }
};




let userTimezone = 'UTC';
let selectedHabit = null; 

//calling refresh token endpoint to get new access token
async function refreshAccessToken() {
  const res = await fetch('/refresh', {
    method: 'POST',
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Session expired. Please log in again.');
}

// Convert UTC → user timezone
function formatDate(utc) {
  return new Date(utc).toLocaleString(undefined, {
    timeZone: userTimezone
  });
}
async function createHabit(title, description) {
  await refreshAccessToken();

  const res = await fetch('/api/habits', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description })
  });

  if (!res.ok) {
    throw new Error('Failed to create habit');
  }
}


async function createLog(habitId, note) {
  await refreshAccessToken();
  const res = await fetch('/api/logs', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ habitId, note })
  });
  if (!res.ok) throw new Error('Failed to create log');
}


/* ---------- data fetching ---------- */

async function fetchUser() {
  await refreshAccessToken();
  const res = await fetch('/api/me', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
}

async function fetchHabits() {
  await refreshAccessToken();
  const res = await fetch('/api/habits', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch habits');
  return res.json();
}

async function fetchLogs(habitId) {
  await refreshAccessToken();
  const res = await fetch(`/api/logs?habit=${habitId}&limit=20`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to fetch logs');
  return res.json();
}

async function renderHabits() {
  const habits = await fetchHabits();
  habitList.innerHTML = '';

  habits.forEach(habit => {
    const li = document.createElement('li');

    const title = document.createElement('div');
    title.textContent = habit.title;
    title.style.fontWeight = '600';
    title.style.cursor = 'pointer';

    const desc = document.createElement('div');
    desc.textContent = habit.description || '';
    desc.style.fontSize = '0.9rem';
    desc.style.opacity = '0.9';

    title.onclick = () => renderLogs(habit);
    desc.onclick = () => renderLogs(habit);


    const addLogBtn = document.createElement('button');
    addLogBtn.textContent = '+ Log';
    addLogBtn.className = 'actionBtn';
    addLogBtn.onclick = async (e) => {
      e.stopPropagation();

      const note = prompt('Log note (optional):');
      try {
        await createLog(habit._id, note || '');
        await renderLogs(habit);
      } catch (err) {
        alert(err.message);
      }
    };

    li.appendChild(title);
    li.appendChild(desc);
    li.appendChild(addLogBtn);

    habitList.appendChild(li);
  });
}


async function renderLogs(habit) {
  selectedHabit = habit;  
  logTitle.textContent = habit.title;
  logList.innerHTML = '';

  const logs = await fetchLogs(habit._id);

  if (logs.length === 0) {
    logList.innerHTML = '<li>No logs yet</li>';
    return;
  }

  logs.forEach(log => {
    const li = document.createElement('li');
    li.textContent = `${log.note || 'No note'} — ${formatDate(log.createdAt)}`;
    logList.appendChild(li);
  });
}

//startup
(async function init() {
  try {
    const user = await fetchUser();
    userTimezone = user.timezone || 'UTC';
    await renderHabits();
  } catch (err) {
    alert(err.message);
    window.location.href = '/login';
  }
})();

function getTimezones() {
  if (typeof Intl !== 'undefined' && Intl.supportedValuesOf) {
    try { return Intl.supportedValuesOf('timeZone'); } catch (e) { /* ignore */ }
  }
  return [
    'UTC','America/New_York','America/Los_Angeles','Europe/London','Europe/Paris',
    'Asia/Tokyo','Asia/Shanghai','Australia/Sydney','America/Chicago','America/Denver'
  ];
}

function openTzModal() {
  if (tzSelect.options.length === 0) {
    const zones = getTimezones();
    zones.forEach(z => {
      const opt = document.createElement('option');
      opt.value = z;
      opt.textContent = z;
      tzSelect.appendChild(opt);
    });
  }

  for (let i=0; i<tzSelect.options.length; i++) {
    if (tzSelect.options[i].value === userTimezone) { tzSelect.selectedIndex = i; break; }
  }

  tzSearch.value = '';
  tzModal.style.display = 'flex';
  tzModal.setAttribute('aria-hidden', 'false');
  tzSearch.focus();
}

function closeTzModal() {
  tzModal.style.display = 'none';
  tzModal.setAttribute('aria-hidden', 'true');
}

tzSearch.addEventListener('input', () => {
  const q = tzSearch.value.trim().toLowerCase();
  for (let opt of tzSelect.options) {
    opt.hidden = q && !opt.value.toLowerCase().includes(q);
  }
  const first = Array.from(tzSelect.options).find(o => !o.hidden);
  if (first) tzSelect.value = first.value;
});

tzCancelBtn.addEventListener('click', closeTzModal);
tzBackdrop.addEventListener('click', closeTzModal);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && tzModal.style.display !== 'none') closeTzModal();
});

tzSaveBtn.addEventListener('click', async () => {
  const tz = tzSelect.value;
  if (!tz) return alert('Please choose a timezone.');

  try {
    await refreshAccessToken();

     const res = await fetch('/api/me', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timezone: tz })
    });

    if (!res.ok) throw new Error('Failed to update timezone on server');

    userTimezone = tz;

    await renderHabits();
    if (selectedHabit) await renderLogs(selectedHabit);

    closeTzModal();
  } catch (err) {
    alert(err.message || 'Unable to save timezone');
  }
});

changeTzBtn.addEventListener('click', openTzModal);
