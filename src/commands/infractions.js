import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { buildEmbed, errorEmbed } from './helpers.js';
import { getWarns } from '../storage/warns.js';

export const infractionsCommand = {
  data: new SlashCommandBuilder()
    .setName('infracciones')
    .setDescription('Muestra las infracciones de un usuario.')
    .addUserOption(opt =>
      opt.setName('usuario')
        .setDescription('El usuario para ver las infracciones')
    ),

  async execute({ interaction, config }) {
    if (!interaction.guild) {
      await interaction.reply({ embeds: [errorEmbed(config, 'Este comando solo funciona dentro de un servidor.')], ephemeral: true });
      return;
    }

    const user = interaction.options.getUser('usuario') ?? interaction.user;
    const warns = await getWarns(interaction.guild.id, user.id);

    if (warns.length === 0) {
      await interaction.reply({ embeds: [buildEmbed(config, '📋 Infractions', `No se encontraron infracciones para **${user.tag}**.`)] });
      return;
    }

    const embed = buildEmbed(config, `📋 Infractions de ${user.username}`)
      .setDescription(`Total de infracciones: **${warns.length}**`)
      .addFields(warns.slice(-5).map(warn => ({
        name: `Warn ID: ${warn.id}`,
        value: `Razón: ${warn.reason}\nFecha: ${new Date(warn.timestamp).toLocaleString(config.locale)}\nModerador: <@${warn.moderatorId}>`,
        inline: false
      })));

    await interaction.reply({ embeds: [embed] });
  }
};