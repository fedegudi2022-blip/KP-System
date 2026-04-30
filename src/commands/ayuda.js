import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { buildEmbed, categorizeHelpEntries } from './helpers.js';
import { helpEntries } from './help-entries.js';

const HELP_BUTTON_PREFIX = 'help_';

function createHelpEmbed(config, client, grouped, category) {
  const entries = grouped[category] ?? [];
  return buildEmbed(config, `📘 Ayuda · ${category}`)
    .setAuthor({ name: `${client.user.username} — Comandos`, iconURL: client.user.displayAvatarURL({ size: 128 }) })
    .setDescription('Usa los botones para navegar entre categorías y ver ejemplos de uso rápido.')
    .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: '📌 Comandos disponibles', value: `Comandos totales: **${helpEntries.length}**`, inline: true },
      { name: '📂 Categoría', value: category, inline: true }
    )
    .addFields(entries.slice(0, 10).map(entry => ({
      name: `> \`${entry.usage}\``,
      value: `**${entry.description}**`,
      inline: false
    })));
}

function buildHelpButtons(categories, activeIndex = 0) {
  const buttons = categories.slice(0, 5).map((category, index) =>
    new ButtonBuilder()
      .setCustomId(`${HELP_BUTTON_PREFIX}${index}`)
      .setLabel(category)
      .setStyle(index === activeIndex ? ButtonStyle.Primary : ButtonStyle.Secondary)
  );

  return new ActionRowBuilder().addComponents(buttons);
}

export async function handleHelpInteraction({ interaction, config, client }) {
  const index = Number(interaction.customId.replace(HELP_BUTTON_PREFIX, ''));
  const grouped = categorizeHelpEntries(helpEntries);
  const categories = Object.keys(grouped);
  const selectedCategory = categories[index] ?? categories[0];
  const embed = createHelpEmbed(config, client, grouped, selectedCategory);
  const row = buildHelpButtons(categories, categories.indexOf(selectedCategory));

  await interaction.update({ embeds: [embed], components: [row] });
}

export const ayudaCommand = {
  data: new SlashCommandBuilder()
    .setName('ayuda')
    .setDescription('Muestra un panel organizado de todos los comandos disponibles.'),

  async execute({ interaction, config, client }) {
    const grouped = categorizeHelpEntries(helpEntries);
    const categories = Object.keys(grouped);
    const embed = createHelpEmbed(config, client, grouped, categories[0]);
    const row = buildHelpButtons(categories, 0);

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }
};
