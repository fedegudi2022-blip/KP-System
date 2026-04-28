import { SlashCommandBuilder } from 'discord.js';
import { buildEmbed } from './helpers.js';

export const pingCommand = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Mide la latencia del bot y API de Discord.'),

  async execute({ interaction, config, client }) {
    const sent = await interaction.reply({
      embeds: [buildEmbed(config, '🏓 Ping', 'Midiendo latencia...').setColor(config.embedColor)],
      fetchReply: true
    });

    const botLatency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(client.ws.ping);
    const uptime = Math.floor(client.uptime / 1000);

    // Función para determinar la calidad y el emoji
    const getQuality = (ms) => {
      if (ms < 50) return { emoji: '🟢', status: 'Excelente' };
      if (ms < 100) return { emoji: '🟢', status: 'Muy bueno' };
      if (ms < 200) return { emoji: '🟡', status: 'Bueno' };
      if (ms < 400) return { emoji: '🟠', status: 'Aceptable' };
      return { emoji: '🔴', status: 'Lento' };
    };

    const botQuality = getQuality(botLatency);
    const apiQuality = getQuality(apiLatency);

    // Convertir uptime a formato legible
    const formatUptime = (seconds) => {
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;

      const parts = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0) parts.push(`${minutes}m`);
      if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

      return parts.join(' ');
    };

    const embed = buildEmbed(config, '🏓 Estadísticas de Ping')
      .setDescription('Información detallada sobre la latencia del bot')
      .setColor(config.embedColor);

    // Sección: Latencia
    embed.addFields({
      name: '⚡ Latencia',
      value:
        `${botQuality.emoji} **Bot:** ${botLatency}ms (${botQuality.status})\n` +
        `${apiQuality.emoji} **API:** ${apiLatency}ms (${apiQuality.status})`,
      inline: true
    });

    // Sección: Estado del Bot
    embed.addFields({
      name: '🔧 Estado del Bot',
      value:
        `🆙 **Uptime:** ${formatUptime(uptime)}\n` +
        `📡 **Conexión:** Activa\n` +
        `🔌 **Shards:** ${client.shard?.count ?? 1}`,
      inline: true
    });

    // Indicador de salud general
    const averageLatency = (botLatency + apiLatency) / 2;
    const healthStatus = averageLatency < 100 ? '✅ Saludable' : averageLatency < 200 ? '⚠️ Normal' : '❌ Problemas';

    embed.addFields({
      name: '📈 Salud General',
      value: healthStatus,
      inline: true
    });

    await interaction.editReply({ embeds: [embed] });
  }
};