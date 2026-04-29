import { SlashCommandBuilder } from 'discord.js';
import { buildEmbed } from './helpers.js';

export const bola8Command = {
  data: new SlashCommandBuilder()
    .setName('bola8')
    .setDescription('Hace una pregunta a la bola mágica.')
    .addStringOption(opt =>
      opt.setName('pregunta')
        .setDescription('Tu pregunta')
        .setRequired(true)
    ),

  async execute({ interaction, config }) {
    const respuestas = [
      { text: 'Definitivamente sí.', icon: '🟢' },
      { text: 'Todo apunta a que sí.', icon: '🟢' },
      { text: 'Sin duda alguna.', icon: '🟢' },
      { text: 'Puedes contar con ello.', icon: '🟢' },
      { text: 'Las señales dicen que sí.', icon: '🟢' },
      { text: 'Lo más probable es que sí.', icon: '🟡' },
      { text: 'La perspectiva es buena.', icon: '🟡' },
      { text: 'Pregunta de nuevo más tarde.', icon: '🟡' },
      { text: 'No puedo predecirlo ahora.', icon: '🟡' },
      { text: 'Concéntrate y pregunta de nuevo.', icon: '🟡' },
      { text: 'No cuentes con ello.', icon: '🔴' },
      { text: 'Mi respuesta es no.', icon: '🔴' },
      { text: 'Las perspectivas no son buenas.', icon: '🔴' },
      { text: 'Muy dudoso.', icon: '🔴' },
      { text: 'Las señales apuntan a que no.', icon: '🔴' }
    ];

    const question = interaction.options.getString('pregunta');
    const respuesta = respuestas[Math.floor(Math.random() * respuestas.length)];

    const embed = buildEmbed(config, '🎱 Bola Mágica')
      .setDescription('La bola mágica dijo...')
      .addFields(
        { name: '❓ Pregunta', value: question, inline: false },
        { name: '🔮 Respuesta', value: `${respuesta.icon} ${respuesta.text}`, inline: false }
      )
      .setFooter({ text: `Preguntado por ${interaction.user.tag}` });

    await interaction.reply({ embeds: [embed] });
  }
};