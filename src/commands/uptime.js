import { SlashCommandBuilder } from 'discord.js';
import { buildEmbed } from './helpers.js';
import { formatDuration } from '../utils/time.js';

export const uptimeCommand = {
  data: new SlashCommandBuilder()
    .setName('tiempo')
    .setDescription('Muestra cuánto tiempo lleva encendido el bot.'),

  async execute({ interaction, config, client }) {
    const embed = buildEmbed(config, '⏱️ Tiempo Activo')
      .setDescription(`El bot lleva **${formatDuration(client.uptime ?? 0)}** en línea.`);

    await interaction.reply({ embeds: [embed] });
  }
};