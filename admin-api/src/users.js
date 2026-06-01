import { readFile, writeFile, mkdir, rename } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const USERS_FILE = process.env.USERS_PATH || join(__dirname, '..', 'data', 'users.json');

const HEART_REFILL_MS = 20 * 60 * 1000; // 20 min per heart
const MAX_HEARTS = 5;
const STARTER_GEMS = 100;
const DAILY_BONUS_GEMS = 30;

let cache = null;
let saving = false;
let pendingSave = false;

function defaultState() {
  return {
    xp: 0,
    hearts: MAX_HEARTS,
    heartsRefilledAt: Date.now(),
    gems: STARTER_GEMS,
    streak: 0,
    lastActiveDate: null,
    lastDailyBonusDate: null,
    completedLessons: [],
    perfectLessons: [],
    achievements: [],
    ownedShop: [],
    settings: { sound: true, animations: true },
  };
}

async function load() {
  if (cache) return cache;
  try {
    const raw = await readFile(USERS_FILE, 'utf8');
    cache = JSON.parse(raw);
    if (!Array.isArray(cache.users)) cache.users = [];
  } catch (e) {
    if (e.code === 'ENOENT') {
      cache = { users: [] };
      await persist();
    } else throw e;
  }
  return cache;
}

async function persist() {
  if (saving) { pendingSave = true; return; }
  saving = true;
  try {
    await mkdir(dirname(USERS_FILE), { recursive: true });
    const tmp = USERS_FILE + '.tmp';
    await writeFile(tmp, JSON.stringify(cache, null, 2), 'utf8');
    await rename(tmp, USERS_FILE);
  } finally {
    saving = false;
    if (pendingSave) { pendingSave = false; setImmediate(persist); }
  }
}

function publicView(u) {
  if (!u) return null;
  const { passwordHash, ...rest } = u;
  return rest;
}

function adminView(u) {
  if (!u) return null;
  const { passwordHash, ...rest } = u;
  return { ...rest, hasPassword: !!passwordHash };
}

function applyHeartRefill(state) {
  if (state.hearts >= MAX_HEARTS) {
    state.heartsRefilledAt = Date.now();
    return state;
  }
  const elapsed = Date.now() - (state.heartsRefilledAt || Date.now());
  const gain = Math.floor(elapsed / HEART_REFILL_MS);
  if (gain > 0) {
    state.hearts = Math.min(MAX_HEARTS, (state.hearts || 0) + gain);
    state.heartsRefilledAt = Date.now() - (elapsed - gain * HEART_REFILL_MS);
    if (state.hearts >= MAX_HEARTS) state.heartsRefilledAt = Date.now();
  }
  return state;
}

function checkAndApplyDailyBonus(state) {
  const today = new Date().toISOString().slice(0, 10);
  if (state.lastDailyBonusDate === today) return { applied: false, gems: 0 };
  state.lastDailyBonusDate = today;
  state.gems = (state.gems || 0) + DAILY_BONUS_GEMS;
  return { applied: true, gems: DAILY_BONUS_GEMS };
}

export async function signup({ name, email, password, avatar }) {
  if (!name || !email || !password) throw new Error('Бардык талааларды толтуруңуз');
  if (password.length < 4) throw new Error('Сыр сөз кеминде 4 белги болуш керек');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Email туура эмес');
  await load();
  const lower = email.trim().toLowerCase();
  if (cache.users.find(u => u.email === lower)) throw new Error('Бул email мурда катталган');
  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: randomUUID(),
    name: name.trim().slice(0, 60),
    email: lower,
    avatar: avatar || '🦅',
    passwordHash,
    createdAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
    state: defaultState(),
  };
  cache.users.push(user);
  await persist();
  return publicView(user);
}

export async function login({ email, password }) {
  if (!email || !password) throw new Error('Email жана сыр сөздү жазыңыз');
  await load();
  const lower = email.trim().toLowerCase();
  const user = cache.users.find(u => u.email === lower);
  if (!user) throw new Error('Email же сыр сөз туура эмес');
  const ok = await bcrypt.compare(password, user.passwordHash || '');
  if (!ok) throw new Error('Email же сыр сөз туура эмес');
  user.lastSeenAt = new Date().toISOString();
  await persist();
  return publicView(user);
}

export async function getById(id) {
  await load();
  const u = cache.users.find(x => x.id === id);
  return u ? publicView(u) : null;
}

// Read full user with refills applied; persists if hearts changed.
export async function fetchMe(id) {
  await load();
  const u = cache.users.find(x => x.id === id);
  if (!u) return null;
  const before = u.state.hearts;
  applyHeartRefill(u.state);
  u.lastSeenAt = new Date().toISOString();
  await persist();
  return publicView(u);
}

// Apply daily bonus once per UTC day. Returns the bonus gained.
export async function claimDailyBonus(id) {
  await load();
  const u = cache.users.find(x => x.id === id);
  if (!u) throw new Error('not found');
  const r = checkAndApplyDailyBonus(u.state);
  if (r.applied) await persist();
  return { user: publicView(u), bonus: r };
}

export async function patchState(id, patch) {
  await load();
  const u = cache.users.find(x => x.id === id);
  if (!u) throw new Error('not found');
  // Whitelist + clamp
  const allowed = ['xp', 'hearts', 'heartsRefilledAt', 'gems', 'streak',
    'lastActiveDate', 'completedLessons', 'perfectLessons', 'achievements',
    'ownedShop', 'boostExpiresAt', 'settings'];
  for (const k of allowed) {
    if (k in (patch || {})) u.state[k] = patch[k];
  }
  if (typeof u.state.hearts === 'number') u.state.hearts = Math.max(0, Math.min(MAX_HEARTS, u.state.hearts));
  if (typeof u.state.xp === 'number') u.state.xp = Math.max(0, Math.floor(u.state.xp));
  if (typeof u.state.gems === 'number') u.state.gems = Math.max(0, Math.floor(u.state.gems));
  u.lastSeenAt = new Date().toISOString();
  applyHeartRefill(u.state);
  await persist();
  return publicView(u);
}

// Auto-award any newly qualified achievements; returns bonus XP gained.
function checkAndAwardAchievements(st, content) {
  const achievements = (content && content.achievements) || [];
  const totalLessons = ((content && content.modules) || []).reduce((a, m) => a + m.lessons.length, 0);
  const earned = new Set(st.achievements || []);
  let xpBonus = 0;

  for (const ach of achievements) {
    if (earned.has(ach.id)) continue;
    let qualified = false;
    switch (ach.id) {
      case 'first':    qualified = (st.completedLessons || []).length >= 1; break;
      case 'streak7':  qualified = (st.streak || 0) >= 7; break;
      case 'xp100':    qualified = (st.xp || 0) >= 100; break;
      case 'xp1000':   qualified = (st.xp || 0) >= 1000; break;
      case 'perfect':  qualified = (st.perfectLessons || []).length >= 1; break;
      case 'expert':   qualified = totalLessons > 0 && (st.completedLessons || []).length >= totalLessons; break;
    }
    if (qualified) { earned.add(ach.id); xpBonus += (ach.xp || 0); }
  }

  st.achievements = [...earned];
  return xpBonus;
}

// Atomic "complete lesson" — server-side rewards so user can't fake.
export async function completeLesson(id, { lessonId, mistakes, isReview }, content = {}) {
  await load();
  const u = cache.users.find(x => x.id === id);
  if (!u) throw new Error('not found');
  const st = u.state;
  applyHeartRefill(st);

  const perfect = (mistakes || 0) === 0;
  const wasCompleted = (st.completedLessons || []).includes(lessonId);

  let xpGain = 0, gemGain = 0;
  if (!isReview) {
    const heartsLost = Math.min(st.hearts || 0, mistakes || 0);
    st.hearts = Math.max(0, (st.hearts || 0) - heartsLost);
    if (st.hearts < MAX_HEARTS && heartsLost > 0) st.heartsRefilledAt = Date.now();

    xpGain = 50 + (perfect ? 25 : 0);
    gemGain = 20 + (perfect ? 5 : 0);

    // Apply 2x XP boost if active
    if (st.boostExpiresAt && st.boostExpiresAt > Date.now()) xpGain *= 2;

    if (!wasCompleted) st.completedLessons.push(lessonId);
    if (perfect && !(st.perfectLessons || []).includes(lessonId)) {
      st.perfectLessons = st.perfectLessons || [];
      st.perfectLessons.push(lessonId);
    }
    bumpStreak(st);
  } else {
    xpGain = perfect ? 10 : 5;
    gemGain = perfect ? 5 : 0;
  }

  st.xp = (st.xp || 0) + xpGain;
  st.gems = (st.gems || 0) + gemGain;

  // Check and award achievements (may add XP bonus)
  const achXp = checkAndAwardAchievements(st, content);
  st.xp += achXp;

  u.lastSeenAt = new Date().toISOString();
  await persist();
  return { user: publicView(u), reward: { xp: xpGain + achXp, gems: gemGain, perfect, isReview } };
}

function bumpStreak(st) {
  const today = new Date().toDateString();
  if (st.lastActiveDate === today) return;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  st.streak = st.lastActiveDate === yesterday ? (st.streak || 0) + 1 : 1;
  st.lastActiveDate = today;
}

// Buy from shop atomically.
export async function buyItem(id, { itemId, price, kind }) {
  await load();
  const u = cache.users.find(x => x.id === id);
  if (!u) throw new Error('not found');
  if ((u.state.gems || 0) < price) throw new Error('Гем жетпейт');
  u.state.gems -= price;
  if (kind === 'hearts') {
    u.state.hearts = MAX_HEARTS;
    u.state.heartsRefilledAt = Date.now();
  } else if (kind === 'xp2x') {
    u.state.boostExpiresAt = Date.now() + 15 * 60 * 1000; // 15 min
  } else {
    const owned = new Set(u.state.ownedShop || []);
    owned.add(itemId);
    u.state.ownedShop = [...owned];
  }
  u.lastSeenAt = new Date().toISOString();
  await persist();
  return publicView(u);
}

export async function leaderboard(limit = 50) {
  await load();
  const list = [...cache.users].sort((a, b) => (b.state?.xp || 0) - (a.state?.xp || 0));
  return list.slice(0, limit).map(u => ({
    id: u.id,
    name: u.name,
    avatar: u.avatar || '🦅',
    xp: u.state?.xp || 0,
    streak: u.state?.streak || 0,
    completed: (u.state?.completedLessons || []).length,
  }));
}

// === Admin functions ===

export async function adminListUsers({ q, sort = 'xp', limit = 500 } = {}) {
  await load();
  let list = cache.users.map(adminView);
  if (q) {
    const ql = q.toLowerCase();
    list = list.filter(u => u.name.toLowerCase().includes(ql) || u.email.toLowerCase().includes(ql));
  }
  if (sort === 'xp') list.sort((a, b) => (b.state?.xp || 0) - (a.state?.xp || 0));
  else if (sort === 'recent') list.sort((a, b) => new Date(b.lastSeenAt) - new Date(a.lastSeenAt));
  else if (sort === 'newest') list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  else if (sort === 'streak') list.sort((a, b) => (b.state?.streak || 0) - (a.state?.streak || 0));
  return list.slice(0, limit);
}

export async function adminGetUser(id) {
  await load();
  const u = cache.users.find(x => x.id === id);
  return u ? adminView(u) : null;
}

export async function adminUpdateUser(id, patch) {
  await load();
  const u = cache.users.find(x => x.id === id);
  if (!u) throw new Error('not found');
  if (patch.name) u.name = String(patch.name).slice(0, 60);
  if (patch.email) u.email = String(patch.email).trim().toLowerCase();
  if (patch.avatar) u.avatar = patch.avatar;
  if (patch.state && typeof patch.state === 'object') {
    for (const k of Object.keys(patch.state)) {
      if (['xp', 'hearts', 'gems', 'streak'].includes(k)) {
        u.state[k] = Math.max(0, Math.floor(patch.state[k] || 0));
        if (k === 'hearts') u.state[k] = Math.min(MAX_HEARTS, u.state[k]);
      }
    }
  }
  if (patch.password) {
    u.passwordHash = await bcrypt.hash(patch.password, 10);
  }
  await persist();
  return adminView(u);
}

export async function adminDeleteUser(id) {
  await load();
  const i = cache.users.findIndex(x => x.id === id);
  if (i < 0) return false;
  cache.users.splice(i, 1);
  await persist();
  return true;
}

export async function adminResetProgress(id) {
  await load();
  const u = cache.users.find(x => x.id === id);
  if (!u) throw new Error('not found');
  u.state = defaultState();
  await persist();
  return adminView(u);
}

export async function adminStats() {
  await load();
  const now = Date.now();
  const day = 86400000;
  const users = cache.users;
  const active7 = users.filter(u => now - new Date(u.lastSeenAt || 0).getTime() < 7 * day).length;
  const active1 = users.filter(u => now - new Date(u.lastSeenAt || 0).getTime() < 1 * day).length;
  const totalXp = users.reduce((a, u) => a + (u.state?.xp || 0), 0);
  const totalLessons = users.reduce((a, u) => a + ((u.state?.completedLessons || []).length), 0);
  const top = [...users].sort((a, b) => (b.state?.xp || 0) - (a.state?.xp || 0))
    .slice(0, 5).map(u => ({ id: u.id, name: u.name, xp: u.state?.xp || 0, avatar: u.avatar || '🦅' }));
  return {
    total: users.length,
    active7,
    active1,
    totalXp,
    totalLessons,
    top,
  };
}

export const config = { HEART_REFILL_MS, MAX_HEARTS, STARTER_GEMS, DAILY_BONUS_GEMS };
