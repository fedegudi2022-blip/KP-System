import { SlashCommandBuilder } from 'discord.js';
import { buildEmbed } from './helpers.js';
import { formatDuration } from '../utils/time.js';

export const infoCommand = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Muestra información general del bot.'),

  async execute({ interaction, config, client }) {
    const totalMembers = client.guilds.cache.reduce((sum, guild) => sum + (guild.memberCount ?? 0), 0);
    const memUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

    const embed = buildEmbed(config, `ℹ️ Información de ${client.user.username}`)
      .setDescription('Estado actual del bot y métricas clave.')
      .addFields(
        { name: '🖥️ Servidores', value: `${client.guilds.cache.size}`, inline: true },
        { name: '👥 Usuarios', value: totalMembers.toLocaleString(), inline: true },
        { name: '⏱️ Uptime', value: formatDuration(client.uptime ?? 0), inline: true },
        { name: '🟢 Node.js', value: process.version, inline: true },
        { name: '📦 discord.js', value: '14.x', inline: true },
        { name: '💾 Memoria', value: `${memUsage} MB`, inline: true },
        { name: '📡 API Ping', value: `${Math.round(client.ws.ping)} ms`, inline: true }
      )
      .setThumbnail(client.user.displayAvatarURL({ size: 256 }));

    await interaction.reply({ embeds: [embed] });
  }
};