import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { errorEmbed, isValidUrl, sanitizeText } from './helpers.js';

export const embedCommand = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Crea un mensaje embed con opciones personalizadas.')
    .addStringOption(opt =>
      opt.setName('titulo')
        .setDescription('Título del embed')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('url')
        .setDescription('URL clickeable en el título')
    )
    .addStringOption(opt =>
      opt.setName('subtitulo')
        .setDescription('Subtítulo o descripción del embed')
    )
    .addStringOption(opt =>
      opt.setName('color')
        .setDescription('Color hexadecimal (por ejemplo #ff0000)')
    )
    .addStringOption(opt =>
      opt.setName('pie')
        .setDescription('Texto del pie de página')
    )
    .addStringOption(opt =>
      opt.setName('imagen')
        .setDescription('URL de imagen grande para el embed')
    )
    .addStringOption(opt =>
      opt.setName('miniatura')
        .setDescription('URL de miniatura para el embed')
    ),

  async execute({ interaction, config }) {
    const title = interaction.options.getString('titulo');
    const url = interaction.options.getString('url');
    const subtitle = interaction.options.getString('subtitulo');
    const colorValue = interaction.options.getString('color');
    const footer = interaction.options.getString('pie');
    const image = interaction.options.getString('imagen');
    const thumbnail = interaction.options.getString('miniatura');

    const sanitizedTitle = sanitizeText(title);
    const sanitizedSubtitle = subtitle ? sanitizeText(subtitle) : '\u200b';

    const embed = new EmbedBuilder()
      .setTitle(sanitizedTitle)
      .setDescription(sanitizedSubtitle)
      .setColor(config.embedColor)
      .setTimestamp();

    if (url) {
      if (!isValidUrl(url)) {
        await interaction.reply({ embeds: [errorEmbed(config, 'URL inválida. Usá un enlace con http o https.')], ephemeral: true });
        return;
      }
      embed.setURL(url);
    }

    if (footer) embed.setFooter({ text: sanitizeText(footer) });
    if (image) {
      if (!isValidUrl(image)) {
        await interaction.reply({ embeds: [errorEmbed(config, 'URL de imagen inválida.')], ephemeral: true });
        return;
      }
      embed.setImage(image);
    }
    if (thumbnail) {
      if (!isValidUrl(thumbnail)) {
        await interaction.reply({ embeds: [errorEmbed(config, 'URL de miniatura inválida.')], ephemeral: true });
        return;
      }
      embed.setThumbnail(thumbnail);
    }

    if (colorValue) {
      const normalized = colorValue.trim().replace(/^#/, '');
      if (/^[0-9A-Fa-f]{6}$/.test(normalized)) {
        embed.setColor(parseInt(normalized, 16));
      } else {
        await interaction.reply({ embeds: [errorEmbed(config, 'Color inválido. Usá un valor hexadecimal como `#ff0000`.')], ephemeral: true });
        return;
      }
    }

    await interaction.reply({ embeds: [embed] });
  }
};