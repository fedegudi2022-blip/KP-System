import { SlashCommandBuilder } from 'discord.js';
import { buildEmbed, categorizeHelpEntries } from './helpers.js';
import { helpEntries } from './help-entries.js';

export const ayudaCommand = {
  data: new SlashCommandBuilder()
    .setName('ayuda')
    .setDescription('Muestra un listado sencillo de todos los comandos disponibles.'),

  async execute({ interaction, config, client }) {
    const grouped = categorizeHelpEntries(helpEntries);
    const categories = Object.keys(grouped);
    const embed = buildEmbed(config, '📘 Ayuda rápida - KP-System')
      .setAuthor({ name: `${client.user.username} — Comandos`, iconURL: client.user.displayAvatarURL({ size: 128 }) })
      .setDescription('Comandos organizados por categoría para que encuentres lo que necesitas rápido.')
      .setThumbnail(client.user.displayAvatarURL({ size: 256 }));

    embed.addFields({
      name: '📌 Resumen',
      value: `Comandos totales: **${helpEntries.length}**\nCategorías: **${categories.length}**\nUsa \/ayuda para ver esta lista limpia y ordenada.`,
      inline: false
    });

    for (const category of categories) {
      const list = grouped[category]
        .map(entry => `• \`${entry.usage}\` — ${entry.description}`)
        .join('\n');

      embed.addFields({ name: category, value: list, inline: false });
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
