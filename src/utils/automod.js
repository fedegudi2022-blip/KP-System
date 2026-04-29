import { PermissionFlagsBits } from 'discord.js';
import { addWarn, getWarns } from '../storage/warns.js';
import { buildEmbed } from '../commands/helpers.js';
import { createAuditEmbed, sendLogMessage } from '../logging.js';

const INVITE_REGEX = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/[A-Za-z0-9-]+/i;
const URL_REGEX = /https?:\/\/[^\s]+/i;
const recentMessageMap = new Map();

function isModerator(member) {
  return member?.permissions?.has(PermissionFlagsBits.ManageMessages) || member?.permissions?.has(PermissionFlagsBits.Administrator);
}

function normalizeMessage(text) {
  return text
    .toLowerCase()
    .replace(/[^A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanupRecentMessages() {
  const now = Date.now();
  for (const [key, entries] of recentMessageMap.entries()) {
    const filtered = entries.filter(entry => now - entry.timestamp < 60 * 1000);
    if (filtered.length > 0) {
      recentMessageMap.set(key, filtered);
    } else {
      recentMessageMap.delete(key);
    }
  }
}

function addRecentMessage(message, normalized, config) {
  const key = `${message.guild.id}:${message.author.id}`;
  const now = Date.now();
  const entries = recentMessageMap.get(key) ?? [];

  entries.push({ normalized, timestamp: now });
  const activeEntries = entries.filter(entry => now - entry.timestamp < (config.automod.spamInterval ?? 8000));
  recentMessageMap.set(key, activeEntries);

  return activeEntries;
}

async function applyAutoSanctions(member, guild, warnCount, config, reason) {
  if (warnCount >= (config.automod.autoBanThreshold ?? 7) && member.bannable) {
    await guild.members.ban(member, { reason });
    return 'ban';
  }

  if (warnCount >= (config.automod.autoKickThreshold ?? 5) && member.kickable) {
    await member.kick(reason);
    return 'kick';
  }

  if (warnCount >= (config.automod.autoMuteThreshold ?? 3) && member.moderatable) {
    const timeoutMinutes = config.automod.mentionTimeoutMinutes ?? 30;
    await member.timeout(timeoutMinutes * 60 * 1000, reason);
    return 'mute';
  }

  return null;
}

async function deleteRecentUserMessages(guild, userId) {
  let totalDeleted = 0;
  const botMember = guild.members.me;

  for (const channel of guild.channels.cache.values()) {
    if (!channel.isTextBased() || !channel.viewable) continue;
    if (!botMember?.permissionsIn(channel).has(PermissionFlagsBits.ManageMessages)) continue;

    try {
      const fetched = await channel.messages.fetch({ limit: 100 });
      const userMessages = fetched.filter(msg => msg.author.id === userId);
      if (userMessages.size > 0) {
        await channel.bulkDelete(userMessages, true).catch(() => null);
        totalDeleted += userMessages.size;
      }
    } catch {
      // Ignorar errores de canales donde no se puede leer o eliminar mensajes.
    }
  }

  return totalDeleted;
}

export async function handleAutomodMessage(message, config) {
  if (!config.automod.enabled) return;
  if (!message.guild || message.author.bot || !message.content) return;

  const member = message.member ?? await message.guild.members.fetch(message.author.id).catch(() => null);
  if (!member || isModerator(member)) return;

  const normalized = normalizeMessage(message.content);

  const hasInvite = INVITE_REGEX.test(message.content);
  const hasExternalLink = URL_REGEX.test(message.content) && !hasInvite;

  const hasBannedWord = config.automod.bannedWords.some(word => normalized.includes(word));
  const hasAttachment = message.attachments.size > 0;
  const mentionsCount = (message.mentions.users.size + message.mentions.roles.size) + (message.mentions.everyone ? 5 : 0);
  const isNewMember = config.automod.newMemberProtectionDays > 0
    && member.joinedTimestamp
    && (Date.now() - member.joinedTimestamp) < config.automod.newMemberProtectionDays * 24 * 60 * 60 * 1000;

  cleanupRecentMessages();
  const recentMessages = addRecentMessage(message, normalized, config);
  const repeatedCount = recentMessages.filter(entry => entry.normalized === normalized).length;
  const isSpam = recentMessages.length >= (config.automod.spamThreshold ?? 5);
  const isRepeatSpam = repeatedCount >= (config.automod.repeatMessageThreshold ?? 3);

  let reason = null;
  let autoMute = false;
  let purgeAcrossChannels = false;

  if (mentionsCount >= (config.automod.mentionThreshold ?? 6) && config.automod.mentionProtection) {
    if (config.automod.mentionAction === 'warn') {
      reason = 'Demasiadas menciones';
      autoMute = true;
    } else {
      reason = 'Spam de menciones';
      purgeAcrossChannels = true;
    }
  }

  if (hasExternalLink && config.automod.linkProtection) {
    reason = 'Enlace externo no permitido';
  }

  if (hasBannedWord && config.automod.wordProtection) {
    reason = 'Palabra prohibida detectada';
  }

  if ((isSpam || isRepeatSpam) && config.automod.spamProtection) {
    reason = 'Mensajes repetidos o spam detectado';
  }

  if (isNewMember && config.automod.newMemberProtection) {
    reason = 'Usuario nuevo con restricción de mensajes';
  }

  if (!reason) return;

  const warnCount = await addWarn(message.guild.id, message.author.id, message.author.tag, reason);
  const action = await applyAutoSanctions(message.member ?? message.author, message.guild, warnCount, config, reason);

  await sendLogMessage(message.guild, createAuditEmbed({
    author: message.author,
    title: 'Automoderación aplicada',
    description: `Acción: ${action ?? 'warning'}\nMotivo: ${reason}`,
    color: 'ORANGE',
  }));

  if (purgeAcrossChannels) {
    await deleteRecentUserMessages(message.guild, message.author.id);
  }
}
