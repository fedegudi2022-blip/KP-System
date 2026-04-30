import { EmbedBuilder } from 'discord.js';
import { sanitizeText } from '../commands/helpers.js';
import {
  deleteReminderById,
  getAllReminders,
  updateReminderSentCount
} from '../storage/reminders.js';

const activeReminders = new Map();

export function getReminderKey(guildId, channelId, userId) {
  return `${guildId}:${channelId}:${userId}`;
}

export function clearActiveReminderById(reminderId) {
  for (const [key, entry] of activeReminders.entries()) {
    if (entry.reminder.id === reminderId) {
      clearInterval(entry.intervalId);
      activeReminders.delete(key);
      return true;
    }
  }
  return false;
}

export function clearActiveReminderByKey(guildId, channelId, userId) {
  const key = getReminderKey(guildId, channelId, userId);
  const entry = activeReminders.get(key);
  if (!entry) return false;

  clearInterval(entry.intervalId);
  activeReminders.delete(key);
  return true;
}

export function buildReminderEmbed(config, reminder, guild, sentCount) {
  const progress = reminder.times > 0 ? ` (${sentCount + 1}/${reminder.times})` : '';
  const embed = new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('🔔 Recordatorio')
    .setAuthor({
      name: 'Recordatorio activo',
      iconURL: guild?.iconURL({ dynamic: true }) ?? null
    })
    .setDescription(sanitizeText(reminder.message))
    .setFooter({ text: `Recordatorio${progress}` })
    .setTimestamp();

  if (guild?.iconURL()) {
    embed.setThumbnail(guild.iconURL({ dynamic: true }));
  }

  embed.addFields(
    { name: 'Canal', value: `<#${reminder.channelId}>`, inline: true },
    { name: 'Intervalo', value: `${reminder.minutes} minuto${reminder.minutes === 1 ? '' : 's'}`, inline: true },
    { name: 'Enviados', value: `${sentCount}`, inline: true },
    { name: 'Restantes', value: reminder.times > 0 ? `${Math.max(reminder.times - sentCount, 0)}` : 'Indefinido', inline: true }
  );

  return embed;
}

async function executeReminder(reminder, channel, config, intervalId, key) {
  if (!channel?.isTextBased()) {
    clearActiveReminderById(reminder.id);
    await deleteReminderById(reminder.id);
    return;
  }

  if (reminder.times > 0 && reminder.sentCount >= reminder.times) {
    clearActiveReminderById(reminder.id);
    await deleteReminderById(reminder.id);
    return;
  }

  try {
    await channel.send({ embeds: [buildReminderEmbed(config, reminder, channel.guild, reminder.sentCount)] });
    reminder.sentCount += 1;
    await updateReminderSentCount(reminder.id, reminder.sentCount);

    if (reminder.times > 0 && reminder.sentCount >= reminder.times) {
      clearActiveReminderById(reminder.id);
      await deleteReminderById(reminder.id);
    }
  } catch (error) {
    console.error('[REMINDER] Error al enviar recordatorio:', error);
    clearActiveReminderById(reminder.id);
    await deleteReminderById(reminder.id);
  }
}

export async function scheduleReminder(reminder, channel, config) {
  const key = getReminderKey(reminder.guildId, reminder.channelId, reminder.userId);
  if (activeReminders.has(key)) {
    clearActiveReminderByKey(reminder.guildId, reminder.channelId, reminder.userId);
  }

  const intervalMs = reminder.minutes * 60_000;
  let intervalId;

  intervalId = setInterval(() => {
    void executeReminder(reminder, channel, config, intervalId, key);
  }, intervalMs);

  activeReminders.set(key, { intervalId, reminder });
}

export async function restoreReminders(client, config) {
  const reminders = await getAllReminders();
  let restored = 0;

  for (const reminder of reminders) {
    if (!reminder.guild_id || !reminder.channel_id || !reminder.user_id) {
      await deleteReminderById(reminder.id);
      continue;
    }

    const guild = client.guilds.cache.get(reminder.guild_id);
    if (!guild) {
      await deleteReminderById(reminder.id);
      continue;
    }

    const channel = await guild.channels.fetch(reminder.channel_id).catch(() => null);
    if (!channel || !channel.isTextBased()) {
      await deleteReminderById(reminder.id);
      continue;
    }

    if (reminder.times > 0 && reminder.sent_count >= reminder.times) {
      await deleteReminderById(reminder.id);
      continue;
    }

    await scheduleReminder({
      id: reminder.id,
      guildId: reminder.guild_id,
      channelId: reminder.channel_id,
      userId: reminder.user_id,
      message: reminder.message,
      minutes: reminder.minutes,
      times: reminder.times,
      sentCount: reminder.sent_count,
      createdAt: reminder.created_at,
      lastSent: reminder.last_sent
    }, channel, config);
    restored += 1;
  }

  return restored;
}
