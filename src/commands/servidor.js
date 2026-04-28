import { SlashCommandBuilder, ChannelType } from 'discord.js';
import { buildEmbed, errorEmbed } from './helpers.js';
import { formatShortDateTime } from '../utils/time.js';

export const servidorCommand = {
  data: new SlashCommandBuilder()
    .setName('servidor')
    .setDescription('Muestra información detallada del servidor actual.'),

  async execute({ interaction, config }) {
    if (!interaction.guild) {
      await interaction.reply({
        embeds: [errorEmbed(config, 'Este comando solo funciona dentro de un servidor.')],
        ephemeral: true
      });
      return;
    }

    try {
      const g = interaction.guild;

      // Contar canales por tipo
      const textChannels = g.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
      const voiceChannels = g.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
      const categoryChannels = g.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;
      const stageChannels = g.channels.cache.filter(c => c.type === ChannelType.GuildStageVoice).size;

      // Estadísticas de miembros
      const totalMembers = g.memberCount;
      const bots = g.members.cache.filter(m => m.user.bot).size;
      const humans = totalMembers - bots;

      // Información de boost
      const boostLevel = g.premiumTier;
      const boostCount = g.premiumSubscriptionCount ?? 0;

      // Embed principal
      const embed = buildEmbed(config, `🏠 ${g.name}`)
        .setDescription(
          `Información completa del servidor **${g.name}**`
        )
        .setThumbnail(g.iconURL({ size: 256 }))
        .setColor(config.embedColor);

      // Sección: Información General
      embed.addFields({
        name: '📊 Información General',
        value:
          `🆔 **ID:** \`${g.id}\`\n` +
          `👑 **Owner:** <@${g.ownerId}>\n` +
          `📅 **Creado:** ${formatShortDateTime(g.createdAt, config.locale, config.timeZone)}`,
        inline: false
      });

      // Sección: Población
      embed.addFields({
        name: '👥 Población',
        value:
          `👤 **Total:** ${totalMembers.toLocaleString()}\n` +
          `🧑 **Humanos:** ${humans.toLocaleString()}\n` +
          `🤖 **Bots:** ${bots.toLocaleString()}`,
        inline: true
      });

      // Sección: Canales
      embed.addFields({
        name: '📢 Canales',
        value:
          `💬 **Texto:** ${textChannels}\n` +
          `🔊 **Voz:** ${voiceChannels}\n` +
          `🎙️ **Stage:** ${stageChannels}\n` +
          `📁 **Categorías:** ${categoryChannels}`,
        inline: true
      });

      // Sección: Configuración
      const verificationLevels = {
        0: 'Ninguno',
        1: 'Bajo',
        2: 'Medio',
        3: 'Alto',
        4: 'Muy Alto'
      };

      const notificationLevels = {
        0: 'Todos',
        1: 'Solo @menciones',
        null: 'Desconocido'
      };

      embed.addFields({
        name: '⚙️ Configuración',
        value:
          `🔐 **Verificación:** Nivel ${g.verificationLevel} (${verificationLevels[g.verificationLevel] || 'Desconocido'})\n` +
          `📢 **Notificaciones:** ${notificationLevels[g.defaultMessageNotifications] || 'Desconocido'}\n` +
          `🎭 **Roles:** ${g.roles.cache.size}`,
        inline: true
      });

      // Sección: Boosts (si hay)
      if (boostLevel > 0) {
        embed.addFields({
          name: '⭐ Nitro Boosts',
          value:
            `✨ **Nivel:** ${boostLevel}/3\n` +
            `🚀 **Boosts:** ${boostCount}`,
          inline: true
        });
      }

      // Sección: Características
      const features = g.features;
      if (features && features.length > 0) {
        const featureNames = features
          .map(f => `• ${f.replace(/_/g, ' ')}`)
          .slice(0, 8)
          .join('\n');
        
        const hasMore = features.length > 8 ? `\n*+${features.length - 8} más*` : '';

        embed.addFields({
          name: `✨ Características (${features.length})`,
          value: featureNames + hasMore,
          inline: false
        });
      }

      // Banner si existe
      if (g.bannerURL()) {
        embed.setImage(g.bannerURL({ size: 512 }));
      }

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error en comando servidor:', error);
      await interaction.reply({
        embeds: [errorEmbed(config, 'Ocurrió un error al obtener la información del servidor.')],
        ephemeral: true
      });
    }
  }
};