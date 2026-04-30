import { SlashCommandBuilder } from 'discord.js';
import { successEmbed, errorEmbed } from './helpers.js';
import { createReminder, deleteReminderByContext, getReminderForUserChannel } from '../storage/reminders.js';
import { clearActiveReminderByKey, scheduleReminder } from '../utils/reminder-manager.js';

export const setrecordatorioCommand = {
  cooldown: 8,
  requireGuild: true,
  data: new SlashCommandBuilder()
    .setName('setrecordatorio')
    .setDescription('Configura un recordatorio periódico que se envía en este canal.')
    .addIntegerOption(opt =>
      opt.setName('minutos')
        .setDescription('Intervalo en minutos entre cada recordatorio (1-1440).')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(1440)
    )
    .addStringOption(opt =>
      opt.setName('mensaje')
        .setDescription('Texto que el bot repetirá cada intervalo.')
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName('veces')
        .setDescription('Número de veces que se repetirá el recordatorio. Dejar vacío para indefinido.')
        .setMinValue(0)
        .setMaxValue(100)
    ),

  async execute({ interaction, config }) {
    const minutes = interaction.options.getInteger('minutos');
    const times = interaction.options.getInteger('veces') ?? 0;
    const message = interaction.options.getString('mensaje')?.trim();
    const channel = interaction.channel;
    const guild = interaction.guild;

    if (!message) {
      await interaction.reply({ embeds: [errorEmbed(config, 'El mensaje no puede quedar vacío.')], ephemeral: true });
      return;
    }

    if (!channel || !channel.isTextBased() || !guild) {
      await interaction.reply({ embeds: [errorEmbed(config, 'No se puede programar recordatorios en este canal.')], ephemeral: true });
      return;
    }

    const existingReminder = await getReminderForUserChannel(guild.id, channel.id, interaction.user.id);
    if (existingReminder) {
      clearActiveReminderByKey(guild.id, channel.id, interaction.user.id);
      await deleteReminderByContext(guild.id, channel.id, interaction.user.id);
    }

    const reminder = {
      id: `rem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      guildId: guild.id,
      channelId: channel.id,
      userId: interaction.user.id,
      message,
      minutes,
      times,
      sentCount: 0,
      createdAt: new Date().toISOString(),
      lastSent: null
    };

    await createReminder(reminder);
    await scheduleReminder(reminder, channel, config);

    await interaction.reply({
      embeds: [
        successEmbed(
          config,
          '✅ Recordatorio configurado',
          `Enviaré tu recordatorio cada **${minutes}** minuto${minutes === 1 ? '' : 's'} en este canal` +
          (times > 0 ? ` un total de **${times}** veces.` : ' hasta que el bot se reinicie.')
        )
      ],
      ephemeral: true
    });
  }
};
