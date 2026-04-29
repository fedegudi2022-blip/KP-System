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

    const embed = successEmbed(config, '👋 ¡Hola!')
      .setDescription(text)
      .setThumbnail(getAvatarUrl(interaction.user))
      .setFooter({ text: 'Usa /ayuda para ver todos los comandos disponibles.' });

    await interaction.reply({ embeds: [embed] });
  }
};