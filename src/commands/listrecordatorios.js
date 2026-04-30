import { SlashCommandBuilder } from 'discord.js';
import { errorEmbed, infoEmbed, sanitizeText } from './helpers.js';
import { getRemindersForUser } from '../storage/reminders.js';

export const listRecordatoriosCommand = {
  cooldown: 6,
  requireGuild: true,
  data: new SlashCommandBuilder()
    .setName('listrecordatorios')
    .setDescription('Lista tus recordatorios activos en este servidor.'),

  async execute({ interaction, config }) {
    if (!interaction.guild) {
      await interaction.reply({ embeds: [errorEmbed(config, 'Este comando solo funciona dentro de un servidor.')], ephemeral: true });
      return;
    }

    const reminders = await getRemindersForUser(interaction.guild.id, interaction.user.id);
    if (!reminders.length) {
      await interaction.reply({ embeds: [infoEmbed(config, 'Sin recordatorios', 'No tenés recordatorios activos en este servidor.')], ephemeral: true });
      return;
    }

    const embed = infoEmbed(config, 'Tus recordatorios activos', 'Aquí están tus recordatorios programados en este servidor.');
    embed.setFields(
      reminders.slice(0, 10).map(reminder => ({
        name: `ID: ${reminder.id}`,
        value:
          `Canal: <#${reminder.channel_id}>
` +
          `Intervalo: ${reminder.minutes} min
` +
          `Restantes: ${reminder.times > 0 ? reminder.times - reminder.sent_count : 'Indefinido'}
` +
          `Mensaje: ${sanitizeText(reminder.message).slice(0, 120)}`,
        inline: false
      }))
    );

    if (reminders.length > 10) {
      embed.setFooter({ text: `Mostrando 10 de ${reminders.length}. Usa /recordatorioinfo <ID> para ver detalles.` });
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
