import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { buildEmbed, errorEmbed } from '../commands/helpers.js';
import crypto from 'node:crypto';

const CONFIRM_PREFIX = 'confirm_action_';
const pendingConfirmations = new Map();
const CONFIRM_TIMEOUT_MS = 120_000;

function buildConfirmationComponents(token, confirmLabel, cancelLabel) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${CONFIRM_PREFIX}${token}_confirm`)
      .setLabel(confirmLabel)
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(`${CONFIRM_PREFIX}${token}_cancel`)
      .setLabel(cancelLabel)
      .setStyle(ButtonStyle.Secondary)
  );
}

export async function requestConfirmation({ interaction, config, title, description, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', authorizedUserId, onConfirm }) {
  const token = crypto.randomUUID();
  pendingConfirmations.set(token, {
    authorizedUserId: authorizedUserId ?? interaction.user.id,
    onConfirm,
    title,
    description
  });

  setTimeout(() => pendingConfirmations.delete(token), CONFIRM_TIMEOUT_MS);

  const components = [buildConfirmationComponents(token, confirmLabel, cancelLabel)];
  await interaction.reply({
    embeds: [buildEmbed(config, title, description)],
    components,
    ephemeral: true
  });

  return token;
}

export async function handleConfirmationInteraction(interaction, config) {
  if (!interaction.isButton() || !interaction.customId.startsWith(CONFIRM_PREFIX)) return false;

  const [token, action] = interaction.customId.slice(CONFIRM_PREFIX.length).split('_');
  const entry = pendingConfirmations.get(token);
  if (!entry) {
    await interaction.reply({ embeds: [errorEmbed(config, 'Esta confirmación expiró o ya no está disponible.')], ephemeral: true });
    return true;
  }

  if (interaction.user.id !== entry.authorizedUserId) {
    await interaction.reply({ embeds: [errorEmbed(config, 'Solo quien inició el comando puede confirmar esta acción.')], ephemeral: true });
    return true;
  }

  if (action === 'cancel') {
    pendingConfirmations.delete(token);
    await interaction.update({ embeds: [buildEmbed(config, 'Operación cancelada', 'No se realizó ningún cambio.')], components: [] });
    return true;
  }

  if (action === 'confirm') {
    pendingConfirmations.delete(token);
    await interaction.update({ embeds: [buildEmbed(config, 'Confirmado', 'Ejecutando la acción solicitada...')], components: [] });

    try {
      await entry.onConfirm();
    } catch (error) {
      console.error('[CONFIRMATION] Error en acción confirmada:', error);
      await interaction.followUp({ embeds: [errorEmbed(config, 'Ocurrió un error al ejecutar la acción confirmada.')], ephemeral: true });
    }

    return true;
  }

  return false;
}
