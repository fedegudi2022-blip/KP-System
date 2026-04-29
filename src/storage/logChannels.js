import { get, run } from './database.js';

export async function getLogChannelId(guildId) {
  const row = await get('SELECT channel_id FROM log_channel WHERE guild_id = ?', [guildId]);
  return row?.channel_id ?? null;
}

export async function setLogChannelId(guildId, channelId) {
  await run(
    'INSERT INTO log_channel (guild_id, channel_id) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET channel_id = excluded.channel_id',
    [guildId, channelId]
  );
  return channelId;
}

export async function removeLogChannelId(guildId) {
  await run('DELETE FROM log_channel WHERE guild_id = ?', [guildId]);
}
