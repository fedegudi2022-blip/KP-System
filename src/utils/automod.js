import { PermissionFlagsBits } from 'discord.js';
import { addWarn } from '../storage/warns.js';
import { buildEmbed } from '../commands/helpers.js';
import { createAuditEmbed, sendLogMessage } from '../logging.js';

const INVITE_REGEX = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/[A-Za-z0-9-]+/i;
const URL_REGEX = /https?:\/\/[^\s]+/i;
const BLACKLISTED_WORDS = ['idiota', 'imbecil'];
const spamMap = new Map();
const SPAM_WINDOW_MS = 8000;
const SPAM_THRESHOLD = 5;

function isModerator(member) {
  return member?.permissions?.has(PermissionFlagsBits.ManageMessages);
}

function cleanupSpamEntries() {
  const now = Date.now();
  for (const [key, timestamps] of spamMap.entries()) {
    spamMap.set(key, timestamps.filter(ts => now - ts < SPAM_WINDOW_MS));
    if (spamMap.get(key)?.length === 0) spamMap.delete(key);
  }
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

  const normalized = message.content.toLowerCase();
  const hasInvite = INVITE_REGEX.test(normalized);
  const hasExternalLink = URL_REGEX.test(normalized);
  const hasBannedWord = BLACKLISTED_WORDS.some(word => normalized.includes(word));
  const hasAttachment = message.attachments.size > 0;
  const mentionsCount = (message.mentions.users.size + message.mentions.roles.size) + (message.mentions.everyone ? 5 : 0);
  const isNewMember = config.automod.newMemberProtectionDays > 0
    && member.joinedTimestamp
    && (Date.now() - member.joinedTimestamp) < config.automod.newMemberProtectionDays * 24 * 60 * 60 * 1000;

  cleanupSpamEntries();
  const key = `${message.guild.id}:${message.author.id}`;
  const timestamps = spamMap.get(key) ?? [];
  timestamps.push(Date.now());
  spamMap.set(key, timestamps);
  const isSpam = timestamps.length >= SPAM_THRESHOLD;

  let reason = null;
  let autoMute = false;
  let purgeAcrossChannels = false;

  if (mentionsCount >= (config.automod.mentionThreshold ?? 6) && config.automod.mentionProtection) {
    reason = 'Uso excesivo de menciones';
    autoMute = true;
    purgeAcrossChannels = true;
  } else if (hasInvite) {
    reason = 'Enlace de invitación de Discord no permitido';
  } else if (hasBannedWord) {
    reason = 'Uso de lenguaje inapropiado';
  } else if (isSpam) {
    reason = 'Envió demasiados mensajes seguidos';
    spamMap.delete(key);
  } else if (hasAttachment && config.automod.suspiciousAttachmentProtection && (hasExternalLink || hasInvite || hasBannedWord || isNewMember)) {
    reason = 'Envío de archivos/medios sospechosos';
  } else if (hasExternalLink && config.automod.inviteProtection) {
    reason = 'Enlace externo sospechoso';
  }

  if (!reason) return;

  await message.delete().catch(() => null);

  let deletedCount = 0;
  if (purgeAcrossChannels) {
    deletedCount = await deleteRecentUserMessages(message.guild, message.author.id);
  }

  if (autoMute && member.moderatable) {
    const timeoutMinutes = config.automod.mentionTimeoutMinutes ?? 30;
    try {
      await member.timeout(timeoutMinutes * 60 * 1000, 'Auto-mute por menciones excesivas');
    } catch {
      // fall through si no se puede mutear
    }
  }

  const warn = await addWarn(message.guild.id, message.author.id, message.client.user.id, `Auto-moderación: ${reason}`);
  const logFields = [
    { name: 'Canal', value: `${message.channel}`, inline: true },
    { name: 'Warn ID', value: warn.id, inline: true }
  ];

  if (autoMute) {
    logFields.push({ name: 'Mute', value: `Sí, ${config.automod.mentionTimeoutMinutes ?? 30} min`, inline: true });
    logFields.push({ name: 'Mensajes eliminados', value: `${deletedCount}`, inline: true });
  }

  const logEmbed = createAuditEmbed('warn', {
    description: `Se eliminó un mensaje de **${message.author.tag}** por auto-moderación.`,
    target: `${message.author.tag} (${message.author.id})`,
    moderator: `${message.client.user.tag}`,
    reason,
    fields: logFields
  });
  await sendLogMessage(message.guild, logEmbed);

  const responseText = autoMute
    ? `Se eliminó un mensaje por: **${reason}**. El usuario fue silenciado y se han purgado mensajes recientes.`
    : `Se eliminó un mensaje por: **${reason}**. Si se repite, podrás recibir sanciones automáticas.`;

  const reply = await message.channel.send({ embeds: [buildEmbed(config, '⚠️ Mensaje eliminado', responseText)] });
  setTimeout(() => reply.delete().catch(() => null), 9_000);
}
