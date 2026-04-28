import { SlashCommandBuilder } from 'discord.js';
import { buildEmbed, categorizeHelpEntries } from './helpers.js';
import { helpEntries } from './help-entries.js';

export const ayudaCommand = {
  data: new SlashCommandBuilder()
    .setName('ayuda')
    .setDescription('Muestra un listado sencillo de todos los comandos disponibles.'),

  async execute({ interaction, config, client }) {
    const grouped = categorizeHelpEntries(helpEntries);
    const embed = buildEmbed(config, '📘 Ayuda rápida - KP-System')
      .setDescription('Un resumen simple con los comandos disponibles. Usa `/comando` para ejecutarlos.')
      .setThumbnail(client.user.displayAvatarURL({ size: 256 }));

    for (const category of Object.keys(grouped)) {
      const list = grouped[category]
        .map(entry => `• **${entry.usage}** — ${entry.description}`)
        .join('\n');

      embed.addFields({ name: category, value: list, inline: false });
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
