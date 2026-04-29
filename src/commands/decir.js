import { SlashCommandBuilder } from 'discord.js';
import { sanitizeText } from './helpers.js';

export const decirCommand = {
  cooldown: 7,
  data: new SlashCommandBuilder()
    .setName('decir')
    .setDescription('Hace que el bot diga un mensaje.')
    .addStringOption(opt =>
      opt.setName('mensaje')
        .setDescription('El mensaje a decir')
        .setRequired(true)
    ),

  async execute({ interaction }) {
    const message = (interaction.options.getString('mensaje') ?? '').trim();

    if (!message) {
      await interaction.reply({ content: 'Debés escribir el mensaje que querés que diga el bot.', ephemeral: true });
      return;
    }

    if (/@everyone|@here/i.test(message)) {
      await interaction.reply({ content: 'No se permiten menciones globales en este comando.', ephemeral: true });
      return;
    }

    const safeMessage = sanitizeText(message);
    if (!safeMessage) {
      await interaction.reply({ content: 'Tu mensaje contiene contenido no válido. Por favor prueba con otro texto.', ephemeral: true });
      return;
    }

    await interaction.reply(safeMessage);
  }
};