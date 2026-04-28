import { SlashCommandBuilder } from 'discord.js';
import { buildEmbed, successEmbed, errorEmbed } from './helpers.js';

const activeReminders = new Map();

function getReminderKey(interaction) {
  return `${interaction.guild?.id ?? 'DM'}:${interaction.channel?.id}:${interaction.user.id}`;
}

export const setrecordatorioCommand = {
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
    const key = getReminderKey(interaction);

    if (!message) {
      await interaction.reply({ embeds: [errorEmbed(config, 'El mensaje no puede quedar vacío.')], ephemeral: true });
      return;
    }

    if (!channel || !channel.isTextBased()) {
      await interaction.reply({ embeds: [errorEmbed(config, 'No se puede programar recordatorios en este canal.')], ephemeral: true });
      return;
    }

    if (activeReminders.has(key)) {
      const previous = activeReminders.get(key);
      clearInterval(previous.intervalId);
      activeReminders.delete(key);
    }

    await interaction.reply({
      embeds: [
        successEmbed(
          config,
          '✅ Recordatorio configurado',
          `Enviaré tu mensaje cada **${minutes}** minuto${minutes === 1 ? '' : 's'} en este canal` +
          (times > 0 ? ` un total de **${times}** veces.` : ' hasta que el bot se reinicie.')
        )
      ],
      ephemeral: true
    });

    let sentCount = 0;
    const intervalId = setInterval(async () => {
      if (times > 0 && sentCount >= times) {
        clearInterval(intervalId);
        activeReminders.delete(key);
        return;
      }

      try {
        await channel.send({ content: `🔔 <@${interaction.user.id}> recordatorio: ${message}` });
        sentCount += 1;

        if (times > 0 && sentCount >= times) {
          clearInterval(intervalId);
          activeReminders.delete(key);
        }
      } catch (error) {
        console.error('Error al enviar recordatorio:', error);
        clearInterval(intervalId);
        activeReminders.delete(key);
      }
    }, minutes * 60_000);

    activeReminders.set(key, { intervalId, message, minutes, times });
  }
};
