import { SlashCommandBuilder } from 'discord.js';
import { buildEmbed } from './helpers.js';

export const pingCommand = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Mide la latencia del bot y API de Discord.'),

  async execute({ interaction, config, client }) {
    const initial = await interaction.reply({
      embeds: [buildEmbed(config, '🏓 Ping', 'Midiendo latencia...').setColor(config.embedColor)],
      fetchReply: true
    });

    const botLatency = initial.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(client.ws.ping);
    const uptimeSeconds = Math.floor((client.uptime ?? 0) / 1000);

    const getQuality = (ms) => {
      if (ms < 50) return { emoji: '🟢', status: 'Excelente' };
      if (ms < 100) return { emoji: '🟢', status: 'Muy bueno' };
      if (ms < 200) return { emoji: '🟡', status: 'Bueno' };
      if (ms < 400) return { emoji: '🟠', status: 'Aceptable' };
      return { emoji: '🔴', status: 'Lento' };
    };

    const formatUptime = (seconds) => {
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      const parts = [];
      if (days) parts.push(`${days}d`);
      if (hours) parts.push(`${hours}h`);
      if (minutes) parts.push(`${minutes}m`);
      if (secs || parts.length === 0) parts.push(`${secs}s`);
      return parts.join(' ');
    };

    const botQuality = getQuality(botLatency);
    const apiQuality = getQuality(apiLatency);
    const averageLatency = Math.round((botLatency + apiLatency) / 2);
    const healthStatus = averageLatency < 100 ? '✅ Saludable' : averageLatency < 200 ? '⚠️ Normal' : '❌ Problemas';

    const embed = buildEmbed(config, '🏓 Estadísticas de Ping')
      .setDescription('Verifica la latencia del bot con Discord y el rendimiento actual.')
      .setThumbnail(client.user.displayAvatarURL({ size: 128 }))
      .addFields(
        { name: '⚡ Latencia', value: `${botQuality.emoji} **Bot:** ${botLatency}ms\n${apiQuality.emoji} **API:** ${apiLatency}ms`, inline: true },
        { name: '🔧 Uptime', value: `${formatUptime(uptimeSeconds)}`, inline: true },
        { name: '📈 Salud general', value: `${healthStatus}`, inline: true },
        { name: '🧠 Memoria', value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB`, inline: true },
        { name: '⚙️ Plataforma', value: `${process.platform}`, inline: true },
        { name: '🔌 Shards', value: `${client.shard?.count ?? 1}`, inline: true }
      );

    await interaction.editReply({ embeds: [embed] });
  }
};