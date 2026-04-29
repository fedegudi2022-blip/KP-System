import { SlashCommandBuilder } from 'discord.js';
import { buildEmbed } from './helpers.js';
import { formatDateTime } from '../utils/time.js';

export const horaCommand = {
  data: new SlashCommandBuilder()
    .setName('hora')
    .setDescription('Muestra la hora actual en la zona configurada.'),

  async execute({ interaction, config }) {
    const now = new Date();
    const formatted = formatDateTime(now, config.locale, config.timeZone);

    const embed = buildEmbed(config, '🕐 Hora Actual')
      .setDescription(`**${formatted}**`)
      .addFields(
        { name: 'Zona horaria', value: `${config.timeZone}`, inline: true },
        { name: 'Localización', value: `${config.locale}`, inline: true }
      )
      .setFooter({ text: `Zona horaria: ${config.timeZone}` });

    await interaction.reply({ embeds: [embed] });
  }
};