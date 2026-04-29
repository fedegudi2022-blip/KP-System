import { EmbedBuilder } from 'discord.js';
import { getLogChannelId } from './storage/logChannels.js';
import { config } from './config.js';

const LOG_TEMPLATES = {
  ban: { title: 'Usuario Baneado', color: 0xdc2626, emoji: '🔨' },
  unban: { title: 'Usuario Desbaneado', color: 0x16a34a, emoji: '✅' },
  kick: { title: 'Usuario Expulsado', color: 0xf59e0b, emoji: '👢' },
  warn: { title: 'Advertencia Registrada', color: 0xf59e0b, emoji: '⚠️' },
  mute: { title: 'Usuario Silenciado', color: 0xf59e0b, emoji: '🔇' },
  unmute: { title: 'Silencio Quitado', color: 0x16a34a, emoji: '🔊' },
  join: { title: 'Usuario Entró', color: 0x10b981, emoji: '➡️' },
  leave: { title: 'Usuario Salió', color: 0xef4444, emoji: '⬅️' },
  setlog: { title: 'Canal de Logs Configurado', color: 0x2563eb, emoji: '📌' },
  clearwarns: { title: 'Advertencias Eliminadas', color: 0x2563eb, emoji: '🧹' },
  messageDelete: { title: 'Mensaje Eliminado', color: 0xef4444, emoji: '🗑️' },
  messageUpdate: { title: 'Mensaje Editado', color: 0xf59e0b, emoji: '✏️' },
  roleCreate: { title: 'Rol Creado', color: 0x10b981, emoji: '🆕' },
  roleDelete: { title: 'Rol Eliminado', color: 0xef4444, emoji: '❌' },
  roleUpdate: { title: 'Rol Actualizado', color: 0x2563eb, emoji: '🔧' },
  channelCreate: { title: 'Canal Creado', color: 0x10b981, emoji: '🆕' },
  channelDelete: { title: 'Canal Eliminado', color: 0xef4444, emoji: '❌' },
  nuke: { title: 'Nuke Ejecutado', color: 0xdc2626, emoji: '💣' }
};

export function createAuditEmbed(type, options = {}) {
  const template = LOG_TEMPLATES[type] ?? { title: 'Evento', color: config.embedColor, emoji: 'ℹ️' };
  const embed = new EmbedBuilder()
    .setTitle(`${template.emoji} ${template.title}`)
    .setColor(template.color)
    .setTimestamp()
    .setFooter({ text: options.footerText ?? config.footerText ?? 'Registro de eventos' });

  if (options.author) {
    embed.setAuthor({ name: options.author, iconURL: options.authorIcon });
  }

  if (options.description) embed.setDescription(options.description);
  if (options.thumbnail) embed.setThumbnail(options.thumbnail);

  const fields = [];
  if (options.target) fields.push({ name: 'Usuario', value: options.target, inline: true });
  if (options.moderator) fields.push({ name: 'Moderador', value: options.moderator, inline: true });
  if (options.duration) fields.push({ name: 'Duración', value: options.duration, inline: true });
  if (options.reason) fields.push({ name: 'Razón', value: options.reason, inline: false });
  if (Array.isArray(options.fields)) fields.push(...options.fields);
  if (fields.length) embed.addFields(fields);

  return embed;
}

export async function sendLogMessage(guild, embed) {
  const channelId = await getLogChannelId(guild.id);
  if (!channelId) return;

  const channel = guild.channels.cache.get(channelId) ?? await guild.channels.fetch(channelId).catch(() => null);
  let targetChannel = channel;
  if (!targetChannel || !targetChannel.isTextBased()) {
    targetChannel = guild.systemChannel?.isTextBased() ? guild.systemChannel : null;
  }

  if (!targetChannel) {
    console.warn('[LOG] No hay canal de logs configurado o válido. Revisa setlog.');
    return;
  }

  try {
    await targetChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error('[LOG] No se pudo enviar el mensaje de log:', error);
  }
}
