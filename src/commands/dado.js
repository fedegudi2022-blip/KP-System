import { SlashCommandBuilder } from 'discord.js';
import { buildEmbed } from './helpers.js';

export const dadoCommand = {
  data: new SlashCommandBuilder()
    .setName('dado')
    .setDescription('Lanza un dado.')
    .addIntegerOption(opt =>
      opt.setName('caras')
        .setDescription('Número de caras del dado (2-1000, por defecto 6)')
        .setMinValue(2)
        .setMaxValue(1000)
    ),

  async execute({ interaction, config }) {
    const sides = interaction.options.getInteger('caras') ?? 6;
    const result = Math.floor(Math.random() * sides) + 1;
    const isMax = result === sides;
    const isMin = result === 1;
    const icon = isMax ? '⭐' : isMin ? '💀' : '🎲';
    const comment = isMax ? '\n¡Número máximo!' : isMin ? '\n¡Número mínimo!' : '';

    const embed = buildEmbed(config, `${icon} Dado d${sides}`)
      .setDescription(`Resultado: **${result}**${comment}`)
      .setFooter({ text: `Rango posible: 1 – ${sides}` });

    await interaction.reply({ embeds: [embed] });
  }
};