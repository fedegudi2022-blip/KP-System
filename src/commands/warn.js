import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { buildEmbed, errorEmbed, successEmbed } from './helpers.js';
import { addWarn, getWarns } from '../storage/warns.js';
import { createAuditEmbed, sendLogMessage } from '../logging.js';

const AUTO_MUTE_THRESHOLD = 3;

export const warnCommand = {
  cooldown: 8,
  permissions: ['ModerateMembers'],
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Avisa a un usuario y registra una infracción.')
    .addUserOption(opt =>
      opt.setName('usuario')
        .setDescription('El usuario a advertir')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('razon')
        .setDescription('Razón de la advertencia')
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
    const reason = interaction.options.getString('razon');

    if (!user) {
      await interaction.reply({ embeds: [errorEmbed(config, 'No pude encontrar ese usuario.')], ephemeral: true });
      return;
    }

    if (user.id === interaction.user.id) {
      await interaction.reply({ embeds: [errorEmbed(config, 'No podés advertirte a vos mismo.')], ephemeral: true });
      return;
    }

    const warn = await addWarn(interaction.guild.id, user.id, interaction.user.id, reason);
    const warns = await getWarns(interaction.guild.id, user.id);

    const embed = successEmbed(config, '⚠️ Advertencia registrada')
      .setDescription(`**${user.tag}** recibió una advertencia.`)
      .addFields(
        { name: '📝 Razón', value: reason, inline: false },
        { name: '📌 Advertencias', value: `${warns.length}`, inline: true },
        { name: '🆔 Warn ID', value: warn.id, inline: true }
      );

    await interaction.reply({ embeds: [embed] });

    const logEmbed = createAuditEmbed('warn', {
      description: `**${user.tag}** recibió una advertencia por **${interaction.user.tag}**.`,
      target: `${user.tag} (${user.id})`,
      moderator: `${interaction.user.tag} (${interaction.user.id})`,
      reason,
      fields: [
        { name: 'Advertencias totales', value: `${warns.length}`, inline: true }
      ]
    });
    await sendLogMessage(interaction.guild, logEmbed);

    if (warns.length >= AUTO_MUTE_THRESHOLD) {
      const member = interaction.guild.members.cache.get(user.id);
      if (member && member.moderatable) {
        try {
          await member.timeout(15 * 60 * 1000, 'Auto-mute por múltiples advertencias');
          const autoMuteEmbed = createAuditEmbed('mute', {
            description: `**${user.tag}** fue silenciado automáticamente tras ${warns.length} advertencias.`,
            target: `${user.tag} (${user.id})`,
            moderator: `${interaction.user.tag} (${interaction.user.id})`,
            duration: '15 minutos',
            reason: 'Auto-mute por múltiples advertencias'
          });
          await sendLogMessage(interaction.guild, autoMuteEmbed);
        } catch (error) {
          console.error('Error al auto-silenciar:', error);
        }
      }
    }
  }
};