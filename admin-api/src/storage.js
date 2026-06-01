import { readFile, writeFile, mkdir, rename } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = process.env.CONTENT_PATH || join(__dirname, '..', 'data', 'content.json');

let cache = null;

export async function load() {
  if (cache) return cache;
  try {
    const raw = await readFile(DATA_FILE, 'utf8');
    cache = JSON.parse(raw);
  } catch (e) {
    if (e.code === 'ENOENT') {
      cache = defaultContent();
      await save(cache);
    } else throw e;
  }
  return cache;
}

export async function save(content) {
  await mkdir(dirname(DATA_FILE), { recursive: true });
  const tmp = DATA_FILE + '.tmp';
  await writeFile(tmp, JSON.stringify(content, null, 2), 'utf8');
  await rename(tmp, DATA_FILE);
  cache = content;
  return content;
}

export async function update(mutator) {
  const current = await load();
  const next = mutator(structuredClone(current));
  await save(next);
  return next;
}

function defaultContent() {
  return { modules: [], achievements: [], leagues: [], shop_items: [], fake_leaderboard: [] };
}

export function dataFilePath() { return DATA_FILE; }
