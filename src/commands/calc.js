import { SlashCommandBuilder } from 'discord.js';
import { errorEmbed, successEmbed } from './helpers.js';

export const calcCommand = {
  data: new SlashCommandBuilder()
    .setName('calc')
    .setDescription('Calcula una expresión matemática básica.')
    .addStringOption(opt =>
      opt.setName('expresion')
        .setDescription('La expresión a calcular')
        .setRequired(true)
    ),

  async execute({ interaction, config }) {
    const expr = interaction.options.getString('expresion');

    if (!/^[\d\s\+\-\*\/\(\)\.\%\^]+$/.test(expr)) {
      await interaction.reply({ embeds: [errorEmbed(config, 'Expresión no válida. Solo se permiten números y operadores básicos (`+ - * / % ( ) ^`).')], ephemeral: true });
      return;
    }

    let result;
    try {
      const sanitized = expr.replace(/\^/g, '**');
      result = Function('"use strict"; return (' + sanitized + ')')();
      if (typeof result !== 'number' || !isFinite(result)) throw new Error();
    } catch {
      await interaction.reply({ embeds: [errorEmbed(config, 'No pude calcular esa expresión. Verificá que sea una expresión matemática válida.')], ephemeral: true });
      return;
    }

    const embed = successEmbed(config, '🧮 Calculadora')
      .addFields(
        { name: '📥 Expresión', value: `\`${expr}\``, inline: true },
        { name: '📤 Resultado', value: `\`${Number(result.toFixed(8))}\``, inline: true }
      );

    await interaction.reply({ embeds: [embed] });
  }
};