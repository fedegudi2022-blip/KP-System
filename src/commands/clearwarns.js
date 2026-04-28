import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { buildEmbed, errorEmbed, successEmbed } from './helpers.js';
import { clearWarns, getWarns } from '../storage/warns.js';
import { createAuditEmbed, sendLogMessage } from '../logging.js';

export const clearwarnsCommand = {
  data: new SlashCommandBuilder()
    .setName('clearwarns')
    .setDescription('Elimina todas las advertencias de un usuario.')
    .addUserOption(opt =>
      opt.setName('usuario')
        .setDescription('El usuario al que limpiar infracciones')
        .setRequired(true)
    ),

  async execute({ interaction, config }) {
    if (!interaction.guild || !interaction.member) {
      await interaction.reply({ embeds: [errorEmbed(config, 'Este comando solo funciona dentro de un servidor.')], ephemeral: true });
      return;
    }

    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      await interaction.reply({ embeds: [errorEmbed(config, 'Necesitás el permiso `Moderate Members` para usar este comando.')], ephemeral: true });
      return;
    }

    const user = interaction.options.getUser('usuario');
    const count = await clearWarns(interaction.guild.id, user.id);
    const remaining = await getWarns(interaction.guild.id, user.id);

    await interaction.reply({ embeds: [successEmbed(config, '🧹 Advertencias eliminadas', `Se eliminaron **${count}** advertencias de **${user.tag}**. Quedan **${remaining.length}** advertencias.`)] });

    const logEmbed = createAuditEmbed('clearwarns', {
      description: `**${user.tag}** tuvo advertencias eliminadas por **${interaction.user.tag}**.`,
      target: `${user.tag} (${user.id})`,
      moderator: `${interaction.user.tag} (${interaction.user.id})`,
      fields: [
        { name: 'Advertencias eliminadas', value: `${count}`, inline: true },
        { name: 'Advertencias restantes', value: `${remaining.length}`, inline: true }
      ]
    });
    await sendLogMessage(interaction.guild, logEmbed);
  }
};
