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
    const message = interaction.options.getString('mensaje');
    const safeMessage = sanitizeText(message);

    if (!safeMessage || /@everyone|@here/i.test(message)) {
      await interaction.reply({ content: 'No se permiten menciones globales en este comando.', ephemeral: true });
      return;
    }

    await interaction.reply(safeMessage);
  }
};