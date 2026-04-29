import { all, run } from './database.js';

export async function getWarns(guildId, userId) {
  return await all(
    'SELECT * FROM warn WHERE guild_id = ? AND user_id = ? ORDER BY timestamp ASC',
    [guildId, userId]
  );
}

export async function addWarn(guildId, userId, moderatorId, reason) {
  const warn = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    guild_id: guildId,
    user_id: userId,
    moderator_id: moderatorId,
    reason,
    timestamp: new Date().toISOString()
  };

  await run(
    'INSERT INTO warn (id, guild_id, user_id, moderator_id, reason, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
    [warn.id, warn.guild_id, warn.user_id, warn.moderator_id, warn.reason, warn.timestamp]
  );

  return {
    id: warn.id,
    moderatorId: warn.moderator_id,
    reason: warn.reason,
    timestamp: warn.timestamp
  };
}

export async function clearWarns(guildId, userId) {
  const result = await run('DELETE FROM warn WHERE guild_id = ? AND user_id = ?', [guildId, userId]);
  return result.changes;
}
