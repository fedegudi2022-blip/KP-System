import { all, get, run } from './database.js';

export async function createReminder(reminder) {
  await run(
    `INSERT INTO reminder (id, guild_id, channel_id, user_id, message, minutes, times, sent_count, created_at, last_sent)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      reminder.id,
      reminder.guildId,
      reminder.channelId,
      reminder.userId,
      reminder.message,
      reminder.minutes,
      reminder.times,
      reminder.sentCount,
      reminder.createdAt,
      reminder.lastSent
    ]
  );

  return reminder;
}

export async function deleteReminderById(id) {
  return await run('DELETE FROM reminder WHERE id = ?', [id]);
}

export async function deleteReminderByContext(guildId, channelId, userId) {
  return await run(
    'DELETE FROM reminder WHERE guild_id = ? AND channel_id = ? AND user_id = ?',
    [guildId, channelId, userId]
  );
}

export async function getReminderById(id) {
  return await get('SELECT * FROM reminder WHERE id = ?', [id]);
}

export async function getReminderForUserChannel(guildId, channelId, userId) {
  return await get(
    'SELECT * FROM reminder WHERE guild_id = ? AND channel_id = ? AND user_id = ?',
    [guildId, channelId, userId]
  );
}

export async function getRemindersForUser(guildId, userId) {
  return await all(
    'SELECT * FROM reminder WHERE guild_id = ? AND user_id = ? ORDER BY created_at ASC',
    [guildId, userId]
  );
}

export async function getRemindersForGuild(guildId) {
  return await all(
    'SELECT * FROM reminder WHERE guild_id = ? ORDER BY created_at ASC',
    [guildId]
  );
}

export async function getAllReminders() {
  return await all('SELECT * FROM reminder ORDER BY created_at ASC');
}

export async function updateReminderSentCount(id, sentCount) {
  return await run(
    'UPDATE reminder SET sent_count = ?, last_sent = ? WHERE id = ?',
    [sentCount, new Date().toISOString(), id]
  );
}
