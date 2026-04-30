import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { buildEmbed, errorEmbed, warningEmbed } from './helpers.js';

const EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];

export const pollCommand = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Crea una encuesta rápida con opciones.')
    .addStringOption(opt =>
      opt.setName('pregunta')
        .setDescription('La pregunta de la encuesta')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('opcion1')
        .setDescription('Opción 1')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('opcion2')
        .setDescription('Opción 2')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('opcion3')
        .setDescription('Opción 3')
    )
    .addStringOption(opt =>
      opt.setName('opcion4')
        .setDescription('Opción 4')
    )
    .addStringOption(opt =>
      opt.setName('opcion5')
        .setDescription('Opción 5')
    ),

  async execute({ interaction, config }) {
    const question = interaction.options.getString('pregunta');
    const options = [
      interaction.options.getString('opcion1'),
      interaction.options.getString('opcion2'),
      interaction.options.getString('opcion3'),
      interaction.options.getString('opcion4'),
      interaction.options.getString('opcion5')
    ].filter(Boolean);

    if (options.length < 2) {
      await interaction.reply({ embeds: [errorEmbed(config, 'Necesitás al menos dos opciones para crear una encuesta.')], ephemeral: true });
      return;
    }

    const description = options.map((option, index) => `${EMOJIS[index]} ${option}`).join('\n');
    const embed = buildEmbed(config, `📊 ${question}`)
      .setDescription(description)
      .setFooter({ text: 'Reacciona para votar' });

    const sent = await interaction.reply({ embeds: [embed], fetchReply: true });
    const channelPermissions = sent.channel.permissionsFor(interaction.client.user);

    if (!channelPermissions?.has(PermissionFlagsBits.AddReactions)) {
      await interaction.followUp({ embeds: [warningEmbed(config, 'No puedo reaccionar en este canal. Los usuarios deberán votar manualmente.')], ephemeral: true });
      return;
    }

    for (let i = 0; i < options.length; i += 1) {
      try {
        await sent.react(EMOJIS[i]);
      } catch {
        // Ignorar si no se puede reaccionar a una opción.
      }
    }
  }
};