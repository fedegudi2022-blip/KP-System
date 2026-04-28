import { SlashCommandBuilder } from 'discord.js';
import { buildEmbed } from './helpers.js';

export const monedaCommand = {
  data: new SlashCommandBuilder()
    .setName('moneda')
    .setDescription('Lanza una moneda al aire.'),

  async execute({ interaction, config }) {
    const isCara = Math.random() < 0.5;
    const result = isCara ? 'Cara' : 'Cruz';
    const icon = isCara ? '🟡' : '⚪';

    const embed = buildEmbed(config, '🪙 Lanzamiento de Moneda')
      .setDescription(`${icon} La moneda cayó en **${result}**.`);

    await interaction.reply({ embeds: [embed] });
  }
};