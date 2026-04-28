import { EmbedBuilder } from 'discord.js';

export function buildEmbed(config, title, description = null) {
  const embed = new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle(sanitizeText(title))
    .setTimestamp()
    .setFooter({ text: config.footerText });

  if (description) embed.setDescription(sanitizeText(description));
  return embed;
}

export function successEmbed(config, title, description) {
  return buildEmbed(config, title, description).setColor(config.successColor);
}

export function errorEmbed(config, description) {
  return new EmbedBuilder()
    .setColor(config.errorColor)
    .setTitle('❌ Error')
    .setDescription(sanitizeText(description))
    .setTimestamp()
    .setFooter({ text: config.footerText });
}

export function getAvatarUrl(user) {
  return user.displayAvatarURL({ size: 1024 });
}

export function categorizeHelpEntries(entries) {
  return entries.reduce((groups, entry) => {
    if (!groups[entry.category]) {
      groups[entry.category] = [];
    }
    groups[entry.category].push(entry);
    return groups;
  }, {});
}

export function sanitizeText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/@everyone/gi, 'everyone')
    .replace(/@here/gi, 'here')
    .replace(/<@&\d+>/g, '')
    .trim();
}

export function isValidUrl(value) {
  if (!value || typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}
