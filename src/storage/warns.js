import { mkdir, readFile, writeFile } from 'node:fs/promises';

const warnFile = new URL('../../data/warns.json', import.meta.url);
let warnCache = null;

async function readStore() {
  if (warnCache) return warnCache;
  try {
    const raw = await readFile(warnFile, 'utf8');
    warnCache = JSON.parse(raw);
    return warnCache;
  } catch (error) {
    if (error.code === 'ENOENT') {
      warnCache = {};
      return warnCache;
    }
    throw error;
  }
}

async function writeStore(data) {
  await mkdir(new URL('../../data', import.meta.url), { recursive: true });
  warnCache = data;
  await writeFile(warnFile, JSON.stringify(data, null, 2), 'utf8');
}

export async function getWarns(guildId, userId) {
  const store = await readStore();
  const guild = store[guildId] ?? {};
  return guild[userId] ?? [];
}

export async function addWarn(guildId, userId, moderatorId, reason) {
  const store = await readStore();
  if (!store[guildId]) store[guildId] = {};
  if (!store[guildId][userId]) store[guildId][userId] = [];

  const warn = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    moderatorId,
    reason,
    timestamp: new Date().toISOString()
  };

  store[guildId][userId].push(warn);
  await writeStore(store);
  return warn;
}

export async function clearWarns(guildId, userId) {
  const store = await readStore();
  if (!store[guildId] || !store[guildId][userId]) return 0;
  const count = store[guildId][userId].length;
  delete store[guildId][userId];
  await writeStore(store);
  return count;
}
