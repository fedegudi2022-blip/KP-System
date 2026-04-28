import { SlashCommandBuilder } from 'discord.js';
import { buildEmbed, errorEmbed, getAvatarUrl } from './helpers.js';
import { formatShortDateTime } from '../utils/time.js';

export const usuarioCommand = {
  data: new SlashCommandBuilder()
    .setName('usuario')
    .setDescription('Muestra información detallada de un usuario.')
    .addUserOption(opt =>
      opt.setName('usuario')
        .setDescription('El usuario a consultar (opcional, por defecto tú)')
        .setRequired(false)
    ),

  async execute({ interaction, config }) {
    try {
      const user = interaction.options.getUser('usuario') ?? interaction.user;
      const member = interaction.options.getMember('usuario') ?? interaction.member;

      // Validaciones
      if (!user) {
        return await interaction.reply({
          embeds: [errorEmbed(config, 'No se pudo obtener la información del usuario.')],
          ephemeral: true
        });
      }

      const embed = buildEmbed(config, `👾: ${user.username}`)
        .setThumbnail(getAvatarUrl(user));

      // ID en la descripción
      embed.setDescription(`\`\`\`${user.id}\`\`\``);

      // Información general del usuario
      const userFields = [
        { name: '🤖 Tipo', value: user.bot ? 'Bot' : 'Usuario', inline: true },
        { name: '📅 Cuenta creada', value: formatShortDateTime(user.createdAt, config.locale, config.timeZone), inline: true }
      ];

      // Información del servidor (si es miembro)
      if (member) {
        userFields.push(
          { name: '📥 Se unió', value: formatShortDateTime(member.joinedAt, config.locale, config.timeZone), inline: true }
        );

        // Estado y permisos
        const isServerOwner = member.id === interaction.guild?.ownerId;
        if (isServerOwner) {
          userFields.push({
            name: '✔ ¿Que eres?',
            value: 'Propietario',
            inline: true
          });
        }
      }

      embed.addFields(userFields);

      // Roles del servidor
      if (member && member.roles.cache.size > 1) {
        const roles = member.roles.cache
          .filter(role => role.id !== interaction.guild?.id)
          .sort((a, b) => b.position - a.position)
          .map(role => role.toString());

        const roleCount = roles.length;
        const displayRoles = roles.slice(0, 20);
        const rolesText = displayRoles.length > 0 
          ? displayRoles.join(' ')
          : 'Sin roles';
        const additionalRoles = roleCount > 20 ? `\n*+${roleCount - 20} más*` : '';

        embed.addFields({
          name: `🎭 Roles (${roleCount})`,
          value: rolesText + additionalRoles,
          inline: false
        });
      }

      // Color del embed según el color del usuario
      if (member?.displayColor && member.displayColor !== 0) {
        embed.setColor(member.displayColor);
      }

      // Información adicional en footer
      embed.setFooter({
        text: `Solicitado por ${interaction.user.username}`,
        iconURL: getAvatarUrl(interaction.user)
      });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error en comando usuario:', error);
      await interaction.reply({
        embeds: [errorEmbed(config, 'Ocurrió un error al obtener la información del usuario.')],
        ephemeral: true
      });
    }
  }
};