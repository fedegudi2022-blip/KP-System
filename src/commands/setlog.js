import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { buildEmbed, successEmbed } from './helpers.js';
import { setLogChannelId } from '../storage/logChannels.js';
import { createAuditEmbed, sendLogMessage } from '../logging.js';

export const setlogCommand = {
  data: new SlashCommandBuilder()
    .setName('setlog')
    .setDescription('Configura el canal donde se enviarán los logs del servidor.')
    .addChannelOption(opt =>
      opt.setName('canal')
        .setDescription('Selecciona el canal de logs')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  async execute({ interaction, config }) {
    if (!interaction.guild || !interaction.member) {
      await interaction.reply({ embeds: [buildEmbed(config, '❌ Error', 'Este comando solo funciona dentro de un servidor.')], ephemeral: true });
      return;
    }

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      await interaction.reply({ embeds: [buildEmbed(config, '❌ Permisos insuficientes', 'Necesitás el permiso `Manage Guild` para configurar el canal de logs.')], ephemeral: true });
      return;
    }

    const channel = interaction.options.getChannel('canal');
    if (!channel || channel.type !== ChannelType.GuildText) {
      await interaction.reply({ embeds: [buildEmbed(config, '❌ Canal inválido', 'Seleccioná un canal de texto válido.')], ephemeral: true });
      return;
    }

    await setLogChannelId(interaction.guild.id, channel.id);

    const embed = successEmbed(config, '📌 Canal de Logs Configurado', `Los logs ahora se enviarán en ${channel}.`);
    await interaction.reply({ embeds: [embed] });

    const logEmbed = createAuditEmbed('setlog', {
      description: `Este canal se configuró como canal de logs por **${interaction.user.tag}**.`,
      fields: [{ name: 'Canal', value: `${channel}`, inline: false }]
    });
    await sendLogMessage(interaction.guild, logEmbed);
  }
};