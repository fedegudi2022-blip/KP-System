import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { buildEmbed, errorEmbed, successEmbed } from './helpers.js';
import { createAuditEmbed, sendLogMessage } from '../logging.js';

export const muteCommand = {
  cooldown: 8,
  permissions: ['ModerateMembers'],
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Silencia a un usuario por tiempo limitado.')
    .addUserOption(opt =>
      opt.setName('usuario')
        .setDescription('El usuario a silenciar')
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName('minutos')
        .setDescription('Minutos de silencio (1-1440)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(1440)
    )
    .addStringOption(opt =>
      opt.setName('razon')
        .setDescription('Razón del silencio')
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
    const minutes = interaction.options.getInteger('minutos');
    const reason = interaction.options.getString('razon') ?? 'Sin razón especificada';

    if (user.id === interaction.user.id) {
      await interaction.reply({ embeds: [errorEmbed(config, 'No podés silenciarte a vos mismo.')], ephemeral: true });
      return;
    }

    if (user.id === botMember.id) {
      await interaction.reply({ embeds: [errorEmbed(config, 'No puedo silenciarme a mí mismo.')], ephemeral: true });
      return;
    }

    const member = interaction.guild.members.cache.get(user.id);
    if (!member) {
      await interaction.reply({ embeds: [errorEmbed(config, 'Este usuario no está en el servidor.')], ephemeral: true });
      return;
    }

    if (!member.moderatable) {
      await interaction.reply({ embeds: [errorEmbed(config, 'No puedo silenciar a este usuario. Puede tener un rol superior.')], ephemeral: true });
      return;
    }

    const duration = minutes * 60 * 1000;

    try {
      await member.timeout(duration, reason);
      const embed = successEmbed(config, '🔇 Usuario Silenciado')
        .setDescription(`**${user.tag}** ha sido silenciado por **${minutes}** minutos.`)
        .addFields({ name: '📝 Razón', value: reason, inline: false });

      await interaction.reply({ embeds: [embed] });

      const logEmbed = createAuditEmbed('mute', {
        description: `**${user.tag}** fue silenciado por **${interaction.user.tag}** durante **${minutes}** minutos.`,
        target: `${user.tag} (${user.id})`,
        moderator: `${interaction.user.tag} (${interaction.user.id})`,
        duration: `${minutes} minutos`,
        reason
      });
      await sendLogMessage(interaction.guild, logEmbed);
    } catch (error) {
      console.error('Error al silenciar:', error);
      await interaction.reply({ embeds: [errorEmbed(config, 'Ocurrió un error al intentar silenciar al usuario.')], ephemeral: true });
    }
  }
};