import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { errorEmbed, successEmbed } from './helpers.js';
import { requestConfirmation } from '../utils/confirmations.js';
import { deleteReminderById, getReminderById, getReminderForUserChannel } from '../storage/reminders.js';
import { clearActiveReminderById, clearActiveReminderByKey } from '../utils/reminder-manager.js';

export const cancelarRecordatorioCommand = {
  cooldown: 6,
  requireGuild: true,
  data: new SlashCommandBuilder()
    .setName('cancelrecordatorio')
    .setDescription('Cancela un recordatorio activo.')
    .addStringOption(opt =>
      opt.setName('id')
        .setDescription('ID del recordatorio a cancelar')
        .setRequired(false)
    ),

  async execute({ interaction, config }) {
    if (!interaction.guild) {
      await interaction.reply({ embeds: [errorEmbed(config, 'Este comando solo funciona dentro de un servidor.')], ephemeral: true });
      return;
    }

    const reminderId = interaction.options.getString('id')?.trim();
    let reminder;

    if (reminderId) {
      reminder = await getReminderById(reminderId);
      if (!reminder || reminder.guild_id !== interaction.guild.id) {
        await interaction.reply({ embeds: [errorEmbed(config, 'No se encontró un recordatorio con ese ID en este servidor.')], ephemeral: true });
        return;
      }
    } else {
      reminder = await getReminderForUserChannel(interaction.guild.id, interaction.channel.id, interaction.user.id);
      if (!reminder) {
        await interaction.reply({ embeds: [errorEmbed(config, 'No hay recordatorios activos tuyos en este canal. Usa /cancelarrecordatorio <ID> si querés cancelar otro.')], ephemeral: true });
        return;
      }
    }

    const isModerator = interaction.member.permissions.has(PermissionFlagsBits.ManageGuild);
    if (reminder.user_id !== interaction.user.id && !isModerator) {
      await interaction.reply({ embeds: [errorEmbed(config, 'Solo el autor del recordatorio o un moderador puede cancelarlo.')], ephemeral: true });
      return;
    }

    await requestConfirmation({
      interaction,
      config,
      title: 'Confirmar cancelación',
      description: `¿Querés cancelar el recordatorio **${reminder.id}**?`,
      confirmLabel: 'Cancelar recordatorio',
      cancelLabel: 'Volver',
      onConfirm: async () => {
        await deleteReminderById(reminder.id);
        clearActiveReminderById(reminder.id);
        clearActiveReminderByKey(reminder.guild_id, reminder.channel_id, reminder.user_id);

        await interaction.followUp({ embeds: [successEmbed(config, 'Recordatorio cancelado').setDescription('El recordatorio fue eliminado y no se volverá a enviar.')], ephemeral: true });
      }
    });
  }
};
