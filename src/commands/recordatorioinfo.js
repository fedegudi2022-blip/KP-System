import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { errorEmbed, infoEmbed, sanitizeText } from './helpers.js';
import { getReminderById, getReminderForUserChannel, getRemindersForUser } from '../storage/reminders.js';

export const recordatorioInfoCommand = {
  cooldown: 6,
  requireGuild: true,
  data: new SlashCommandBuilder()
    .setName('recordatorioinfo')
    .setDescription('Muestra los detalles de un recordatorio activo.')
    .addStringOption(opt =>
      opt.setName('id')
        .setDescription('ID del recordatorio')
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
        const userReminders = await getRemindersForUser(interaction.guild.id, interaction.user.id);
        if (userReminders.length === 1) {
          reminder = userReminders[0];
        } else if (userReminders.length > 1) {
          await interaction.reply({
            embeds: [errorEmbed(config, 'Hay varios recordatorios activos. Usa el ID con /recordatorioinfo <ID>.')],
            ephemeral: true
          });
          return;
        } else {
          await interaction.reply({ embeds: [infoEmbed(config, 'Sin recordatorio', 'No tenés recordatorios activos en este canal o servidor.')], ephemeral: true });
          return;
        }
      }
    }

    if (reminder.user_id !== interaction.user.id && !interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      await interaction.reply({ embeds: [errorEmbed(config, 'Solo el autor o un moderador puede ver este recordatorio.')], ephemeral: true });
      return;
    }

    const remaining = reminder.times > 0 ? Math.max(reminder.times - reminder.sent_count, 0) : 'Indefinido';
    const embed = infoEmbed(config, 'Detalle del recordatorio', `ID: \`${reminder.id}\`\n`)
      .addFields(
        { name: 'Canal', value: `<#${reminder.channel_id}>`, inline: true },
        { name: 'Intervalo', value: `${reminder.minutes} min`, inline: true },
        { name: 'Veces', value: reminder.times > 0 ? `${reminder.times}` : 'Indefinido', inline: true },
        { name: 'Enviados', value: `${reminder.sent_count}`, inline: true },
        { name: 'Restantes', value: `${remaining}`, inline: true },
        { name: 'Mensaje', value: sanitizeText(reminder.message).slice(0, 1024), inline: false }
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};