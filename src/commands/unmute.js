import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { buildEmbed, errorEmbed, successEmbed } from './helpers.js';
import { createAuditEmbed, sendLogMessage } from '../logging.js';

export const unmuteCommand = {
  cooldown: 8,
  permissions: ['ModerateMembers'],
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Quita el silencio a un usuario.')
    .addUserOption(opt =>
      opt.setName('usuario')
        .setDescription('El usuario a desilenciar')
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

    const botMember = interaction.guild.members.me;
    if (!botMember?.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      await interaction.reply({ embeds: [errorEmbed(config, 'Necesito el permiso `Moderate Members` para usar este comando.')], ephemeral: true });
      return;
    }

    const user = interaction.options.getUser('usuario');
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) {
      await interaction.reply({ embeds: [errorEmbed(config, 'Este usuario no está en el servidor.')], ephemeral: true });
      return;
    }

    if (!member.moderatable) {
      await interaction.reply({ embeds: [errorEmbed(config, 'No puedo quitar el silencio a este usuario. Puede tener un rol superior.')], ephemeral: true });
      return;
    }

    if (!member.isCommunicationDisabled()) {
      await interaction.reply({ embeds: [errorEmbed(config, 'Este usuario no está silenciado.')], ephemeral: true });
      return;
    }

    try {
      await member.timeout(null);
      const embed = successEmbed(config, '🔊 Usuario Desilenciado')
        .setDescription(`**${user.tag}** ya puede hablar nuevamente.`);

      await interaction.reply({ embeds: [embed] });

      const logEmbed = createAuditEmbed('unmute', {
        description: `**${user.tag}** recuperó su permiso de hablar por **${interaction.user.tag}**.`,
        target: `${user.tag} (${user.id})`,
        moderator: `${interaction.user.tag} (${interaction.user.id})`,
        reason: 'Silencio removido'
      });
      await sendLogMessage(interaction.guild, logEmbed);
    } catch (error) {
      console.error('Error al desilenciar:', error);
      await interaction.reply({ embeds: [errorEmbed(config, 'Ocurrió un error al intentar desilenciar al usuario.')], ephemeral: true });
    }
  }
};