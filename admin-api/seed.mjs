// Seed content.json from existing js/data.js
import { readFile, writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';

const SRC = process.argv[2] || '/www/wwwroot/may.caim.dev/js/data.js';
const DST = process.argv[3] || './data/content.json';

const code = await readFile(SRC, 'utf8');
const sandbox = { window: {} };
// Evaluate by stripping the trailing "window.FL_DATA = ..." line and using Function constructor
const fn = new Function('window', code + '; return window.FL_DATA;');
const data = fn(sandbox.window);

const content = {
  modules:          data.MODULES          || [],
  achievements:     data.ACHIEVEMENTS     || [],
  leagues:          data.LEAGUES          || [],
  shop_items:       data.SHOP_ITEMS       || [],
  fake_leaderboard: data.FAKE_LEADERBOARD || [],
};

await mkdir(dirname(DST), { recursive: true });
await writeFile(DST, JSON.stringify(content, null, 2));
console.log(`seeded → ${DST}  (modules=${content.modules.length} achievements=${content.achievements.length} leagues=${content.leagues.length} shop=${content.shop_items.length})`);
