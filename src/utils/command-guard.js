import { PermissionFlagsBits } from 'discord.js';
import { errorEmbed } from '../commands/helpers.js';
import { getCooldownRemaining, isOnCooldown, setCooldown } from './cooldowns.js';

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
      return { allowed: false, reply: { embeds: [errorEmbed(config, `Necesitás el permiso \`${missing[0]}\` para usar este comando.`)], ephemeral: true } };
    }
  }

  if (isOnCooldown(command.data.name, userId, guildId)) {
    const remaining = Math.ceil(getCooldownRemaining(command.data.name, userId, guildId) / 1000);
    return { allowed: false, reply: { embeds: [errorEmbed(config, `Espera **${remaining}** segundos antes de volver a usar este comando.`)], ephemeral: true } };
  }

  setCooldown(command.data.name, userId, guildId, cooldown);
  return { allowed: true };
}
