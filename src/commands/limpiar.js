import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { buildEmbed, errorEmbed, successEmbed } from './helpers.js';

export const limpiarCommand = {
  permissions: ['ManageMessages'],
  data: new SlashCommandBuilder()
    .setName('limpiar')
    .setDescription('Borra mensajes recientes del canal.')
    .addIntegerOption(opt =>
      opt.setName('cantidad')
        .setDescription('Cantidad de mensajes a borrar (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ),

  async execute({ interaction, config }) {
    if (!interaction.guild || !interaction.member) {
      await interaction.reply({ embeds: [errorEmbed(config, 'Este comando solo funciona dentro de un servidor.')], ephemeral: true });
      return;
    }

    const amount = interaction.options.getInteger('cantidad');

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      await interaction.reply({ embeds: [errorEmbed(config, 'Necesitás el permiso `Manage Messages` para usar este comando.')], ephemeral: true });
      return;
    }

    const botMember = interaction.guild.members.me;
    if (!botMember?.permissionsIn(interaction.channel).has(PermissionFlagsBits.ManageMessages)) {
      await interaction.reply({ embeds: [errorEmbed(config, 'Necesito el permiso `Manage Messages` en este canal.')], ephemeral: true });
      return;
    }

    if (typeof interaction.channel.bulkDelete !== 'function') {
      await interaction.reply({ embeds: [errorEmbed(config, 'No puedo borrar mensajes en este canal.')], ephemeral: true });
      return;
    }

    const deleted = await interaction.channel.bulkDelete(amount, true);
    const deletedCount = deleted.size;

    const embed = successEmbed(config, '🗑️ Mensajes Eliminados', `Se eliminaron **${deletedCount}** mensajes.`);

    await interaction.reply({ embeds: [embed] });
  }
};