import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { buildEmbed, errorEmbed, successEmbed } from './helpers.js';
import { createAuditEmbed, sendLogMessage } from '../logging.js';

export const unbanCommand = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Quita el baneo a un usuario del servidor.')
    .addUserOption(opt =>
      opt.setName('usuario')
        .setDescription('El usuario a desbanear')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('razon')
        .setDescription('Razón para quitar el baneo')
    ),

  async execute({ interaction, config }) {
    if (!interaction.guild || !interaction.member) {
      await interaction.reply({ embeds: [errorEmbed(config, 'Este comando solo funciona dentro de un servidor.')], ephemeral: true });
      return;
    }

    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      await interaction.reply({ embeds: [errorEmbed(config, 'Necesitás el permiso `Ban Members` para usar este comando.')], ephemeral: true });
      return;
    }

    const botMember = interaction.guild.members.me;
    if (!botMember?.permissions.has(PermissionFlagsBits.BanMembers)) {
      await interaction.reply({ embeds: [errorEmbed(config, 'Necesito el permiso `Ban Members` para usar este comando.')], ephemeral: true });
      return;
    }

    const user = interaction.options.getUser('usuario');
    const reason = interaction.options.getString('razon') ?? 'Sin razón especificada';

    if (user.id === interaction.user.id) {
      await interaction.reply({ embeds: [errorEmbed(config, 'No podés desbanearte a vos mismo.')], ephemeral: true });
      return;
    }

    try {
      await interaction.guild.bans.remove(user.id, reason);
      const embed = successEmbed(config, '✅ Usuario Desbaneado')
        .setDescription(`**${user.tag}** ya no está baneado.`)
        .addFields({ name: '📝 Razón', value: reason, inline: false });

      await interaction.reply({ embeds: [embed] });

      const logEmbed = createAuditEmbed('unban', {
        description: `**${user.tag}** fue desbaneado por **${interaction.user.tag}**.`,
        fields: [{ name: 'Razón', value: reason, inline: false }]
      });
      await sendLogMessage(interaction.guild, logEmbed);
    } catch (error) {
      console.error('Error al desbanear:', error);
      await interaction.reply({ embeds: [errorEmbed(config, 'Ocurrió un error al intentar desbanear al usuario.')], ephemeral: true });
    }
  }
};