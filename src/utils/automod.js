import { PermissionFlagsBits } from 'discord.js';
import { addWarn, getWarns } from '../storage/warns.js';
import { buildEmbed } from '../commands/helpers.js';
import { createAuditEmbed, sendLogMessage } from '../logging.js';

const INVITE_REGEX = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/[A-Za-z0-9-]+/i;
const URL_REGEX = /https?:\/\/[\S]+/i;
const recentMessageMap = new Map();

function isModerator(member) {
  return member?.permissions?.has(PermissionFlagsBits.ManageMessages) || member?.permissions?.has(PermissionFlagsBits.Administrator);
}

function normalizeMessage(text) {
  return text
    .toLowerCase()
    .replace(/[^
\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanupRecentMessages() {
  const now = Date.now();
  for (const [key, entries] of recentMessageMap.entries()) {
    const activeEntries = entries.filter(entry => now - entry.timestamp < 60 * 1000);
    if (activeEntries.length > 0) {
      recentMessageMap.set(key, activeEntries);
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
  const windowMs = config.automod.repeatMessageWindowMs ?? 15 * 1000;
  const activeEntries = entries.filter(entry => now - entry.timestamp < windowMs);
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
  if (!message.channel?.isTextBased()) return;

  const member = message.member ?? await message.guild.members.fetch(message.author.id).catch(() => null);
  if (!member || isModerator(member)) return;

  const normalized = normalizeMessage(message.content);
  const hasInvite = INVITE_REGEX.test(normalized);
  const hasExternalLink = URL_REGEX.test(message.content) && !hasInvite;
  const hasBannedWord = config.automod.bannedWords.some(word => normalized.includes(word.toLowerCase()));
  const hasAttachment = message.attachments.size > 0;
  const mentionsCount = message.mentions.users.size + message.mentions.roles.size + (message.mentions.everyone ? 5 : 0);
  const isNewMember = config.automod.newMemberProtectionDays > 0 && member.joinedTimestamp
    && (Date.now() - member.joinedTimestamp) < config.automod.newMemberProtectionDays * 24 * 60 * 60 * 1000;

  cleanupRecentMessages();
  const recentMessages = addRecentMessage(message, normalized, config);
  const repeatedCount = recentMessages.filter(entry => entry.normalized === normalized).length;
  const isSpam = recentMessages.length >= (config.automod.spamThreshold ?? 5);
  const isRepeatSpam = repeatedCount >= (config.automod.repeatMessageThreshold ?? 3);

  let reason = null;
  let purgeAcrossChannels = false;

  if (mentionsCount >= (config.automod.mentionThreshold ?? 6) && config.automod.mentionProtection) {
    reason = 'Uso excesivo de menciones';
    purgeAcrossChannels = true;
  } else if (hasInvite && config.automod.inviteProtection) {
    reason = 'Enlace de invitación de Discord no permitido';
  } else if (hasBannedWord) {
    reason = 'Uso de lenguaje inapropiado';
  } else if (isRepeatSpam) {
    reason = 'Repetición de mensajes detectada';
  } else if (isSpam) {
    reason = 'Envío excesivo de mensajes seguidos';
  } else if (hasAttachment && config.automod.suspiciousAttachmentProtection && (hasExternalLink || hasInvite || hasBannedWord || isNewMember)) {
    reason = 'Envío de archivos o enlaces sospechosos';
  } else if (hasExternalLink && config.automod.inviteProtection) {
    reason = 'Enlace externo sospechoso';
  }

  if (!reason) return;

  await message.delete().catch(() => null);

  let deletedCount = 0;
  if (purgeAcrossChannels) {
    deletedCount = await deleteRecentUserMessages(message.guild, message.author.id);
  }

  const warn = await addWarn(message.guild.id, message.author.id, message.client.user.id, `Auto-moderación: ${reason}`);
  const warns = await getWarns(message.guild.id, message.author.id);
  const sanction = await applyAutoSanctions(member, message.guild, warns.length, config, `Auto-moderación: ${reason}`);

  const logFields = [
    { name: 'Canal', value: `${message.channel}`, inline: true },
    { name: 'Warn ID', value: warn.id, inline: true },
    { name: 'Advertencias totales', value: `${warns.length}`, inline: true }
  ];

  if (purgeAcrossChannels) {
    logFields.push({ name: 'Mensajes purgados', value: `${deletedCount}`, inline: true });
  }

  if (sanction === 'mute') {
    logFields.push({ name: 'Acción', value: 'Silenciado automáticamente', inline: true });
  } else if (sanction === 'kick') {
    logFields.push({ name: 'Acción', value: 'Expulsado automáticamente', inline: true });
  } else if (sanction === 'ban') {
    logFields.push({ name: 'Acción', value: 'Baneado automáticamente', inline: true });
  }

  const logEmbed = createAuditEmbed('warn', {
    description: `Se eliminó un mensaje de **${message.author.tag}** por auto-moderación.`,
    target: `${message.author.tag} (${message.author.id})`,
    moderator: `${message.client.user.tag}`,
    reason,
    fields: logFields
  });
  await sendLogMessage(message.guild, logEmbed);

  const responseText = sanction
    ? `Se eliminó un mensaje por: **${reason}**. Se aplicó una sanción automática adicional: **${sanction}**.`
    : `Se eliminó un mensaje por: **${reason}**. Si se repite, se aplicarán sanciones automáticas.`;

  const responseEmbed = buildEmbed(config, '🛡️ Moderación automática', responseText);
  const reply = await message.channel.send({ embeds: [responseEmbed] });
  setTimeout(() => reply.delete().catch(() => null), 9_000);
}
