const cooldownCache = new Map();

function makeKey(commandName, userId, guildId) {
  return `${guildId ?? 'global'}:${commandName}:${userId}`;
}

export function getCooldownRemaining(commandName, userId, guildId) {
  const key = makeKey(commandName, userId, guildId);
  const expiresAt = cooldownCache.get(key);
  if (!expiresAt) return 0;
  return Math.max(0, expiresAt - Date.now());
}

export function setCooldown(commandName, userId, guildId, durationMs) {
  const key = makeKey(commandName, userId, guildId);
  cooldownCache.set(key, Date.now() + durationMs);
}

export function isOnCooldown(commandName, userId, guildId) {
  return getCooldownRemaining(commandName, userId, guildId) > 0;
}
