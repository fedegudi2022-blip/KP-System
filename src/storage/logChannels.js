import { mkdir, readFile, writeFile } from 'node:fs/promises';

const logFile = new URL('../../data/logChannels.json', import.meta.url);
const logDir = new URL('../../data', import.meta.url);

async function readStore() {
  try {
    const raw = await readFile(logFile, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') return {};
    throw error;
  }
}

async function writeStore(data) {
  await mkdir(logDir, { recursive: true });
  await writeFile(logFile, JSON.stringify(data, null, 2), 'utf8');
}

export async function getLogChannelId(guildId) {
  const store = await readStore();
  return store[guildId] ?? null;
}

export async function setLogChannelId(guildId, channelId) {
  const store = await readStore();
  store[guildId] = channelId;
  await writeStore(store);
  return channelId;
}

export async function removeLogChannelId(guildId) {
  const store = await readStore();
  if (store[guildId]) {
    delete store[guildId];
    await writeStore(store);
  }
}
