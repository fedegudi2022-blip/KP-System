import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { buildEmbed, errorEmbed, successEmbed } from './helpers.js';
import { requestConfirmation } from '../utils/confirmations.js';
import { createAuditEmbed, sendLogMessage } from '../logging.js';

export const kickCommand = {
  cooldown: 8,
  permissions: ['KickMembers'],
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulsa a un usuario del servidor.')
    .addUserOption(opt =>
      opt.setName('usuario')
        .setDescription('El usuario a expulsar')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('razon')
        .setDescription('Razón de la expulsión')
    ),

  async execute({ interaction, config }) {
    if (!interaction.guild || !interaction.member) {
      await interaction.reply({ embeds: [errorEmbed(config, 'Este comando solo funciona dentro de un servidor.')], ephemeral: true });
      return;
    }

    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      await interaction.reply({ embeds: [errorEmbed(config, 'Necesitás el permiso `Kick Members` para usar este comando.')], ephemeral: true });
      return;
    }

    const botMember = interaction.guild.members.me;
    if (!botMember?.permissions.has(PermissionFlagsBits.KickMembers)) {
      await interaction.reply({ embeds: [errorEmbed(config, 'Necesito el permiso `Kick Members` para usar este comando.')], ephemeral: true });
      return;
    }

    const user = interaction.options.getUser('usuario');
    const reason = interaction.options.getString('razon') ?? 'Sin razón especificada';

    if (user.id === interaction.user.id) {
      await interaction.reply({ embeds: [errorEmbed(config, 'No podés expulsarte a vos mismo.')], ephemeral: true });
      return;
    }

    if (user.id === botMember.id) {
      await interaction.reply({ embeds: [errorEmbed(config, 'No puedo expulsarme a mí mismo.')], ephemeral: true });
      return;
    }

    const member = interaction.guild.members.cache.get(user.id);
    if (!member) {
      await interaction.reply({ embeds: [errorEmbed(config, 'Este usuario no está en el servidor.')], ephemeral: true });
      return;
    }

    if (!member.kickable) {
      await interaction.reply({ embeds: [errorEmbed(config, 'No puedo expulsar a este usuario. Puede tener un rol superior.')], ephemeral: true });
      return;
    }

    await requestConfirmation({
      interaction,
      config,
      title: 'Confirmar expulsión',
      description: `¿Querés expulsar a **${user.tag}**? Esta acción lo sacará del servidor.`,
      confirmLabel: 'Expulsar',
      cancelLabel: 'Cancelar',
      onConfirm: async () => {
        try {
          await member.kick(reason);
          const embed = successEmbed(config, '👢 Usuario Expulsado')
            .setDescription(`**${user.tag}** ha sido expulsado del servidor.`)
            .addFields({ name: '📝 Razón', value: reason, inline: false });

          await interaction.followUp({ embeds: [embed], ephemeral: true });

          const logEmbed = createAuditEmbed('kick', {
            description: `**${user.tag}** fue expulsado por **${interaction.user.tag}**.`,
            target: `${user.tag} (${user.id})`,
            moderator: `${interaction.user.tag} (${interaction.user.id})`,
            reason
          });
          await sendLogMessage(interaction.guild, logEmbed);
        } catch (error) {
          console.error('Error al expulsar:', error);
          await interaction.followUp({ embeds: [errorEmbed(config, 'Ocurrió un error al intentar expulsar al usuario.')], ephemeral: true });
        }
      }
    });
  }
};