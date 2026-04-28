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
  setlog: { title: 'Canal de Logs Configurado', color: 0x2563eb, emoji: '📌' }
};

export function createAuditEmbed(type, options) {
  const template = LOG_TEMPLATES[type] ?? { title: 'Evento', color: config.embedColor, emoji: 'ℹ️' };
  const embed = new EmbedBuilder()
    .setTitle(`${template.emoji} ${template.title}`)
    .setColor(template.color)
    .setTimestamp()
    .setFooter({ text: 'Registro de eventos' });

  if (options.description) embed.setDescription(options.description);
  if (options.thumbnail) embed.setThumbnail(options.thumbnail);
  if (options.fields) embed.addFields(options.fields);

  return embed;
}

export async function sendLogMessage(guild, embed) {
  const channelId = await getLogChannelId(guild.id);
  if (!channelId) return;

  const channel = guild.channels.cache.get(channelId) ?? await guild.channels.fetch(channelId).catch(() => null);
  if (!channel || !channel.isTextBased()) return;

  try {
    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('[LOG] No se pudo enviar el mensaje de log:', error);
  }
}
