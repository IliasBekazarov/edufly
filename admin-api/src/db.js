// Unified storage: MongoDB when MONGO_URI is set, file otherwise.
import { MongoClient } from 'mongodb';
import { readFile, writeFile, mkdir, rename } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const USERS_FILE = process.env.USERS_PATH || join(__dirname, '..', 'data', 'users.json');

// ── MongoDB ──────────────────────────────────────────────────────────────────
let _client = null;
let _db = null;

async function mongo() {
  if (_db) return _db;
  _client = new MongoClient(process.env.MONGO_URI);
  await _client.connect();
  _db = _client.db('finlingvo');
  // Index on email for fast lookup
  await _db.collection('users').createIndex({ email: 1 }, { unique: true });
  console.log('MongoDB connected');
  return _db;
}

// ── File fallback ─────────────────────────────────────────────────────────────
let _cache = null;
let _saving = false;
let _pending = false;

async function fileLoad() {
  if (_cache) return _cache;
  try {
    const raw = await readFile(USERS_FILE, 'utf8');
    _cache = JSON.parse(raw);
    if (!Array.isArray(_cache.users)) _cache.users = [];
  } catch (e) {
    if (e.code === 'ENOENT') {
      _cache = { users: [] };
      await filePersist();
    } else throw e;
  }
  return _cache;
}

async function filePersist() {
  if (_saving) { _pending = true; return; }
  _saving = true;
  try {
    await mkdir(dirname(USERS_FILE), { recursive: true });
    const tmp = USERS_FILE + '.tmp';
    await writeFile(tmp, JSON.stringify(_cache, null, 2), 'utf8');
    await rename(tmp, USERS_FILE);
  } finally {
    _saving = false;
    if (_pending) { _pending = false; setImmediate(filePersist); }
  }
}

// ── Unified API ───────────────────────────────────────────────────────────────
const USE_MONGO = !!process.env.MONGO_URI;

export async function getAllUsers() {
  if (USE_MONGO) {
    const db = await mongo();
    return db.collection('users').find({}).toArray();
  }
  const data = await fileLoad();
  return data.users;
}

export async function findUserByEmail(email) {
  if (USE_MONGO) {
    const db = await mongo();
    return db.collection('users').findOne({ email });
  }
  const data = await fileLoad();
  return data.users.find(u => u.email === email) || null;
}

export async function findUserById(id) {
  if (USE_MONGO) {
    const db = await mongo();
    return db.collection('users').findOne({ id });
  }
  const data = await fileLoad();
  return data.users.find(u => u.id === id) || null;
}

export async function insertUser(user) {
  if (USE_MONGO) {
    const db = await mongo();
    await db.collection('users').insertOne({ ...user, _id: user.id });
    return user;
  }
  const data = await fileLoad();
  data.users.push(user);
  await filePersist();
  return user;
}

export async function updateUser(id, patch) {
  if (USE_MONGO) {
    const db = await mongo();
    await db.collection('users').updateOne({ id }, { $set: patch });
    return db.collection('users').findOne({ id });
  }
  const data = await fileLoad();
  const u = data.users.find(x => x.id === id);
  if (!u) return null;
  Object.assign(u, patch);
  await filePersist();
  return u;
}

export async function deleteUser(id) {
  if (USE_MONGO) {
    const db = await mongo();
    const r = await db.collection('users').deleteOne({ id });
    return r.deletedCount > 0;
  }
  const data = await fileLoad();
  const i = data.users.findIndex(x => x.id === id);
  if (i < 0) return false;
  data.users.splice(i, 1);
  await filePersist();
  return true;
}

export async function persistUser(user) {
  return updateUser(user.id, user);
}
