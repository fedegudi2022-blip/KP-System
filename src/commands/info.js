import { SlashCommandBuilder } from 'discord.js';
import { buildEmbed } from './helpers.js';
import { formatDuration } from '../utils/time.js';

export const infoCommand = {
  data: new SlashCommandBuilder()
    .setName('informacion')
    .setDescription('Muestra información general del bot.'),

  async execute({ interaction, config, client }) {
    const totalMembers = client.guilds.cache.reduce((sum, guild) => sum + (guild.memberCount ?? 0), 0);
    const memUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
    const uptime = formatDuration(client.uptime ?? 0);

    const embed = buildEmbed(config, `ℹ️ Información de ${client.user.username}`)
      .setDescription('Estado actual del bot y métricas clave.')
      .addFields(
        { name: '🖥️ Servidores', value: `${client.guilds.cache.size}`, inline: true },
        { name: '👥 Usuarios', value: totalMembers.toLocaleString(), inline: true },
        { name: '⏱️ Tiempo activo', value: uptime, inline: true },
        { name: '📡 API Ping', value: `${Math.round(client.ws.ping)} ms`, inline: true },
        { name: '💾 Memoria usada', value: `${memUsage} MB`, inline: true },
        { name: '⚙️ Plataforma', value: process.platform, inline: true }
      )
      .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
      .setFooter({ text: `discord.js 14 · Node ${process.version}` });

    await interaction.reply({ embeds: [embed] });
  }
};