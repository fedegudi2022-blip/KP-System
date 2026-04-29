import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { buildEmbed, errorEmbed, successEmbed } from './helpers.js';
import { requestConfirmation } from '../utils/confirmations.js';
import { createAuditEmbed, sendLogMessage } from '../logging.js';

export const banCommand = {
  cooldown: 8,
  permissions: ['BanMembers'],
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Banea a un usuario del servidor.')
    .addUserOption(opt =>
      opt.setName('usuario')
        .setDescription('El usuario a banear')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('razon')
        .setDescription('Razón del baneo')
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
      await interaction.reply({ embeds: [errorEmbed(config, 'No podés banearte a vos mismo.')], ephemeral: true });
      return;
    }

    if (user.id === botMember.id) {
      await interaction.reply({ embeds: [errorEmbed(config, 'No puedo banearme a mí mismo.')], ephemeral: true });
      return;
    }

    const member = interaction.guild.members.cache.get(user.id);
    if (member && !member.bannable) {
      await interaction.reply({ embeds: [errorEmbed(config, 'No puedo banear a este usuario. Puede tener un rol superior.')], ephemeral: true });
      return;
    }

    await requestConfirmation({
      interaction,
      config,
      title: 'Confirmar baneo',
      description: `¿Querés banear a **${user.tag}**? Esta acción expulsará al usuario del servidor.`,
      confirmLabel: 'Banear',
      cancelLabel: 'Cancelar',
      onConfirm: async () => {
        try {
          await interaction.guild.members.ban(user, { reason });
          const embed = successEmbed(config, '🔨 Usuario Baneado')
            .setDescription(`**${user.tag}** ha sido baneado del servidor.`)
            .addFields({ name: '📝 Razón', value: reason, inline: false });

          await interaction.followUp({ embeds: [embed], ephemeral: true });

          const logEmbed = createAuditEmbed('ban', {
            description: `**${user.tag}** fue baneado por **${interaction.user.tag}**.`,
            target: `${user.tag} (${user.id})`,
            moderator: `${interaction.user.tag} (${interaction.user.id})`,
            reason
          });
          await sendLogMessage(interaction.guild, logEmbed);
        } catch (error) {
          console.error('Error al banear:', error);
          await interaction.followUp({ embeds: [errorEmbed(config, 'Ocurrió un error al intentar banear al usuario.')], ephemeral: true });
        }
      }
    });
  }
};