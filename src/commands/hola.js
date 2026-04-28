import { SlashCommandBuilder } from 'discord.js';
import { successEmbed, getAvatarUrl } from './helpers.js';

export const holaCommand = {
  data: new SlashCommandBuilder()
    .setName('hola')
    .setDescription('Saluda al bot.'),

  async execute({ interaction, config }) {
    const greetings = [
      `¡Hola, **${interaction.user.username}**! Estoy listo para ayudarte.`,
      `¡Buenas, **${interaction.user.username}**! ¿En qué puedo ayudarte?`,
      `¡Hey **${interaction.user.username}**! Aquí estoy cuando me necesites.`,
      `¡Qué tal, **${interaction.user.username}**! A tus órdenes.`
    ];
    const text = greetings[Math.floor(Math.random() * greetings.length)];

    const embed = successEmbed(config, '👋 ¡Hola!', text)
      .setThumbnail(getAvatarUrl(interaction.user));

    await interaction.reply({ embeds: [embed] });
  }
};