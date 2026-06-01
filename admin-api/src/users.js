import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import {
  getAllUsers, findUserByEmail, findUserById,
  insertUser, updateUser, deleteUser, persistUser,
} from './db.js';

const HEART_REFILL_MS = 20 * 60 * 1000;
const MAX_HEARTS = 5;
const STARTER_GEMS = 100;
const DAILY_BONUS_GEMS = 30;

function defaultState() {
  return {
    xp: 0, hearts: MAX_HEARTS, heartsRefilledAt: Date.now(),
    gems: STARTER_GEMS, streak: 0, lastActiveDate: null,
    lastDailyBonusDate: null, completedLessons: [], perfectLessons: [],
    achievements: [], ownedShop: [], boostExpiresAt: null,
    settings: { sound: true, animations: true },
  };
}

function publicView(u) {
  if (!u) return null;
  const { passwordHash, _id, ...rest } = u;
  return rest;
}

function adminView(u) {
  if (!u) return null;
  const { passwordHash, _id, ...rest } = u;
  return { ...rest, hasPassword: !!passwordHash };
}

function applyHeartRefill(state) {
  if (state.hearts >= MAX_HEARTS) { state.heartsRefilledAt = Date.now(); return state; }
  const elapsed = Date.now() - (state.heartsRefilledAt || Date.now());
  const gain = Math.floor(elapsed / HEART_REFILL_MS);
  if (gain > 0) {
    state.hearts = Math.min(MAX_HEARTS, (state.hearts || 0) + gain);
    state.heartsRefilledAt = Date.now() - (elapsed - gain * HEART_REFILL_MS);
    if (state.hearts >= MAX_HEARTS) state.heartsRefilledAt = Date.now();
  }
  return state;
}

export async function signup({ name, email, password, avatar }) {
  if (!name || !email || !password) throw new Error('Бардык талааларды толтуруңуз');
  if (password.length < 4) throw new Error('Сыр сөз кеминде 4 белги болуш керек');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Email туура эмес');
  const lower = email.trim().toLowerCase();
  if (await findUserByEmail(lower)) throw new Error('Бул email мурда катталган');
  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: randomUUID(), name: name.trim().slice(0, 60), email: lower,
    avatar: avatar || '🦅', passwordHash,
    createdAt: new Date().toISOString(), lastSeenAt: new Date().toISOString(),
    state: defaultState(),
  };
  await insertUser(user);
  return publicView(user);
}

export async function login({ email, password }) {
  if (!email || !password) throw new Error('Email жана сыр сөздү жазыңыз');
  const lower = email.trim().toLowerCase();
  const user = await findUserByEmail(lower);
  if (!user) throw new Error('Email же сыр сөз туура эмес');
  const ok = await bcrypt.compare(password, user.passwordHash || '');
  if (!ok) throw new Error('Email же сыр сөз туура эмес');
  await updateUser(user.id, { lastSeenAt: new Date().toISOString() });
  return publicView(user);
}

export async function getById(id) {
  const u = await findUserById(id);
  return u ? publicView(u) : null;
}

export async function fetchMe(id) {
  const u = await findUserById(id);
  if (!u) return null;
  applyHeartRefill(u.state);
  u.lastSeenAt = new Date().toISOString();
  await updateUser(id, { state: u.state, lastSeenAt: u.lastSeenAt });
  return publicView(u);
}

export async function claimDailyBonus(id) {
  const u = await findUserById(id);
  if (!u) throw new Error('not found');
  const today = new Date().toISOString().slice(0, 10);
  if (u.state.lastDailyBonusDate === today) return { user: publicView(u), bonus: { applied: false, gems: 0 } };
  u.state.lastDailyBonusDate = today;
  u.state.gems = (u.state.gems || 0) + DAILY_BONUS_GEMS;
  await updateUser(id, { state: u.state });
  return { user: publicView(u), bonus: { applied: true, gems: DAILY_BONUS_GEMS } };
}

export async function patchState(id, patch) {
  const u = await findUserById(id);
  if (!u) throw new Error('not found');
  const allowed = ['xp', 'hearts', 'heartsRefilledAt', 'gems', 'streak',
    'lastActiveDate', 'completedLessons', 'perfectLessons', 'achievements',
    'ownedShop', 'boostExpiresAt', 'settings'];
  for (const k of allowed) {
    if (k in (patch || {})) u.state[k] = patch[k];
  }
  if (typeof u.state.hearts === 'number') u.state.hearts = Math.max(0, Math.min(MAX_HEARTS, u.state.hearts));
  if (typeof u.state.xp === 'number') u.state.xp = Math.max(0, Math.floor(u.state.xp));
  if (typeof u.state.gems === 'number') u.state.gems = Math.max(0, Math.floor(u.state.gems));
  applyHeartRefill(u.state);
  u.lastSeenAt = new Date().toISOString();
  await updateUser(id, { state: u.state, lastSeenAt: u.lastSeenAt });
  return publicView(u);
}

function checkAndAwardAchievements(st, content) {
  const achievements = (content && content.achievements) || [];
  const totalLessons = ((content && content.modules) || []).reduce((a, m) => a + m.lessons.length, 0);
  const earned = new Set(st.achievements || []);
  let xpBonus = 0;
  for (const ach of achievements) {
    if (earned.has(ach.id)) continue;
    let qualified = false;
    switch (ach.id) {
      case 'first':   qualified = (st.completedLessons || []).length >= 1; break;
      case 'streak7': qualified = (st.streak || 0) >= 7; break;
      case 'xp100':   qualified = (st.xp || 0) >= 100; break;
      case 'xp1000':  qualified = (st.xp || 0) >= 1000; break;
      case 'perfect': qualified = (st.perfectLessons || []).length >= 1; break;
      case 'expert':  qualified = totalLessons > 0 && (st.completedLessons || []).length >= totalLessons; break;
    }
    if (qualified) { earned.add(ach.id); xpBonus += (ach.xp || 0); }
  }
  st.achievements = [...earned];
  return xpBonus;
}

export async function completeLesson(id, { lessonId, mistakes, isReview }, content = {}) {
  const u = await findUserById(id);
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

  const achXp = checkAndAwardAchievements(st, content);
  st.xp += achXp;

  u.lastSeenAt = new Date().toISOString();
  await updateUser(id, { state: st, lastSeenAt: u.lastSeenAt });
  return { user: publicView({ ...u, state: st }), reward: { xp: xpGain + achXp, gems: gemGain, perfect, isReview } };
}

function bumpStreak(st) {
  const today = new Date().toDateString();
  if (st.lastActiveDate === today) return;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  st.streak = st.lastActiveDate === yesterday ? (st.streak || 0) + 1 : 1;
  st.lastActiveDate = today;
}

export async function buyItem(id, { itemId, price, kind }) {
  const u = await findUserById(id);
  if (!u) throw new Error('not found');
  if ((u.state.gems || 0) < price) throw new Error('Гем жетпейт');
  u.state.gems -= price;
  if (kind === 'hearts') {
    u.state.hearts = MAX_HEARTS;
    u.state.heartsRefilledAt = Date.now();
  } else if (kind === 'xp2x') {
    u.state.boostExpiresAt = Date.now() + 15 * 60 * 1000;
  } else {
    const owned = new Set(u.state.ownedShop || []);
    owned.add(itemId);
    u.state.ownedShop = [...owned];
  }
  u.lastSeenAt = new Date().toISOString();
  await updateUser(id, { state: u.state, lastSeenAt: u.lastSeenAt });
  return publicView(u);
}

export async function leaderboard(limit = 50) {
  const users = await getAllUsers();
  return users
    .sort((a, b) => (b.state?.xp || 0) - (a.state?.xp || 0))
    .slice(0, limit)
    .map(u => ({ id: u.id, name: u.name, avatar: u.avatar || '🦅', xp: u.state?.xp || 0, streak: u.state?.streak || 0, completed: (u.state?.completedLessons || []).length }));
}

export async function adminListUsers({ q, sort = 'xp', limit = 500 } = {}) {
  let list = (await getAllUsers()).map(adminView);
  if (q) {
    const ql = q.toLowerCase();
    list = list.filter(u => u.name?.toLowerCase().includes(ql) || u.email?.toLowerCase().includes(ql));
  }
  if (sort === 'xp') list.sort((a, b) => (b.state?.xp || 0) - (a.state?.xp || 0));
  else if (sort === 'recent') list.sort((a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime());
  else if (sort === 'newest') list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  else if (sort === 'streak') list.sort((a, b) => (b.state?.streak || 0) - (a.state?.streak || 0));
  return list.slice(0, limit);
}

export async function adminGetUser(id) {
  const u = await findUserById(id);
  return u ? adminView(u) : null;
}

export async function adminUpdateUser(id, patch) {
  const u = await findUserById(id);
  if (!u) throw new Error('not found');
  const updates = {};
  if (patch.name) updates.name = String(patch.name).slice(0, 60);
  if (patch.email) updates.email = String(patch.email).trim().toLowerCase();
  if (patch.avatar) updates.avatar = patch.avatar;
  if (patch.state && typeof patch.state === 'object') {
    const st = { ...u.state };
    for (const k of ['xp', 'hearts', 'gems', 'streak']) {
      if (k in patch.state) {
        st[k] = Math.max(0, Math.floor(patch.state[k] || 0));
        if (k === 'hearts') st[k] = Math.min(MAX_HEARTS, st[k]);
      }
    }
    updates.state = st;
  }
  if (patch.password) updates.passwordHash = await bcrypt.hash(patch.password, 10);
  const updated = await updateUser(id, updates);
  return adminView(updated);
}

export async function adminDeleteUser(id) {
  return deleteUser(id);
}

export async function adminResetProgress(id) {
  const u = await findUserById(id);
  if (!u) throw new Error('not found');
  await updateUser(id, { state: defaultState() });
  const updated = await findUserById(id);
  return adminView(updated);
}

export async function adminStats() {
  const users = await getAllUsers();
  const now = Date.now(), day = 86400000;
  const active7 = users.filter(u => now - new Date(u.lastSeenAt || 0).getTime() < 7 * day).length;
  const active1 = users.filter(u => now - new Date(u.lastSeenAt || 0).getTime() < day).length;
  const totalXp = users.reduce((a, u) => a + (u.state?.xp || 0), 0);
  const totalLessons = users.reduce((a, u) => a + ((u.state?.completedLessons || []).length), 0);
  const top = [...users].sort((a, b) => (b.state?.xp || 0) - (a.state?.xp || 0))
    .slice(0, 5).map(u => ({ id: u.id, name: u.name, xp: u.state?.xp || 0, avatar: u.avatar || '🦅' }));
  return { total: users.length, active7, active1, totalXp, totalLessons, top };
}

export const config = { HEART_REFILL_MS, MAX_HEARTS, STARTER_GEMS, DAILY_BONUS_GEMS };
