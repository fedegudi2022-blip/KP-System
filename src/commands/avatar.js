import { SlashCommandBuilder } from 'discord.js';
import { buildEmbed, getAvatarUrl } from './helpers.js';

export const avatarCommand = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Muestra el avatar de un usuario.')
    .addUserOption(opt =>
      opt.setName('usuario')
        .setDescription('El usuario (opcional, por defecto tú)')
    ),

  async execute({ interaction, config }) {
    const user = interaction.options.getUser('usuario') ?? interaction.user;
    const avatarUrl = getAvatarUrl(user);

    const embed = buildEmbed(config, `🖼️ Avatar de ${user.username}`)
      .setDescription(`[Descargar avatar](${avatarUrl})`)
      .setImage(avatarUrl);

    await interaction.reply({ embeds: [embed] });
  }
};