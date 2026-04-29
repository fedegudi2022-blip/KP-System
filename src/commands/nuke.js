import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { buildEmbed, errorEmbed, successEmbed } from './helpers.js';
import { requestConfirmation } from '../utils/confirmations.js';

export const nukeCommand = {
  cooldown: 30,
  permissions: ['Administrator'],
  data: new SlashCommandBuilder()
    .setName('nuke')
    .setDescription('Borra TODOS los mensajes del canal (EXTREMADAMENTE PELIGROSO).'),

  async execute({ interaction, config }) {
    if (!interaction.guild || !interaction.member) {
      await interaction.reply({ embeds: [errorEmbed(config, 'Este comando solo funciona dentro de un servidor.')], ephemeral: true });
      return;
    }

    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      await interaction.reply({ embeds: [errorEmbed(config, 'Este comando requiere permisos de Administrador.')], ephemeral: true });
      return;
    }

    const botMember = interaction.guild.members.me;
    if (!botMember?.permissionsIn(interaction.channel).has(PermissionFlagsBits.ManageMessages)) {
      await interaction.reply({ embeds: [errorEmbed(config, 'Necesito el permiso `Manage Messages` en este canal.')], ephemeral: true });
      return;
    }

    await requestConfirmation({
      interaction,
      config,
      title: 'Confirmar nuke',
      description: 'Esta acción eliminará todos los mensajes visibles del canal. ¿Deseás continuar?',
      confirmLabel: 'Ejecutar Nuke',
      cancelLabel: 'Cancelar',
      onConfirm: async () => {
        if (!interaction.channel || !interaction.channel.isTextBased()) {
          await interaction.followUp({ embeds: [errorEmbed(config, 'No se puede ejecutar nuke en este canal.')], ephemeral: true });
          return;
        }

        let deleted = 0;
        let fetched;
        do {
          fetched = await interaction.channel.messages.fetch({ limit: 100 });
          if (fetched.size > 0) {
            await interaction.channel.bulkDelete(fetched, true).catch(() => null);
            deleted += fetched.size;
          }
        } while (fetched && fetched.size > 0);

        const embed = successEmbed(config, '💣 Nuke Completado')
          .setDescription(`Se eliminaron **${deleted}** mensajes del canal.`);

        await interaction.followUp({ embeds: [embed], ephemeral: true });
      }
    });
  }
};