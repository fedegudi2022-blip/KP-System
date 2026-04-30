import { PermissionFlagsBits } from 'discord.js';
import { errorEmbed } from '../commands/helpers.js';
import { getCooldownRemaining, isOnCooldown, setCooldown } from './cooldowns.js';

const PERMISSION_LABELS = {
  BanMembers: 'Banear Miembros',
  KickMembers: 'Expulsar Miembros',
  ModerateMembers: 'Silenciar Miembros',
  ManageMessages: 'Gestionar Mensajes',
  ManageChannels: 'Gestionar Canales',
  ManageGuild: 'Gestionar Servidor',
  Administrator: 'Administrador',
  ManageRoles: 'Gestionar Roles'
};

export async function validateCommandExecution({ interaction, command, config }) {
  const cooldown = typeof command.cooldown === 'number' ? command.cooldown * 1000 : config.defaultCooldown * 1000;
  const guildId = interaction.guild?.id;
  const userId = interaction.user.id;

  if (command.requireGuild && !interaction.guild) {
    return { allowed: false, reply: { embeds: [errorEmbed(config, 'Este comando solo se puede usar dentro de un servidor.')], ephemeral: true } };
  }

  if (command.permissions?.length) {
    const missing = command.permissions.filter(permission => !interaction.member?.permissions.has(PermissionFlagsBits[permission]));
    if (missing.length > 0) {
      const permissionLabel = PERMISSION_LABELS[missing[0]] ?? missing[0];
      return { allowed: false, reply: { embeds: [errorEmbed(config, `Necesitás el permiso \`${permissionLabel}\` para usar este comando.`)], ephemeral: true } };
    }
  }

  if (command.requiredRoles?.length && interaction.guild) {
    const missingRoles = command.requiredRoles.filter(role =>
      !interaction.member?.roles.cache.some(r => r.id === role || r.name === role)
    );
    if (missingRoles.length > 0) {
      return { allowed: false, reply: { embeds: [errorEmbed(config, 'No tenés el rol requerido para usar este comando.')], ephemeral: true } };
    }
  }

  if (command.botPermissions?.length && interaction.guild) {
    const botMember = interaction.guild.members.me;
    const missingBot = command.botPermissions.filter(permission => !botMember?.permissions.has(PermissionFlagsBits[permission]));
    if (missingBot.length > 0) {
      const permissionLabel = PERMISSION_LABELS[missingBot[0]] ?? missingBot[0];
      return { allowed: false, reply: { embeds: [errorEmbed(config, `Necesito el permiso \`${permissionLabel}\` para ejecutar este comando.`)], ephemeral: true } };
    }
  }

  if (isOnCooldown(command.data.name, userId, guildId)) {
    const remaining = Math.ceil(getCooldownRemaining(command.data.name, userId, guildId) / 1000);
    return { allowed: false, reply: { embeds: [errorEmbed(config, `Espera **${remaining}** segundos antes de volver a usar este comando.`)], ephemeral: true } };
  }

  setCooldown(command.data.name, userId, guildId, cooldown);
  return { allowed: true };
}
