import 'dotenv/config';
import { ActivityType, Client, Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import { slashCommands } from './commands/index.js';
import { categorizeHelpEntries, buildEmbed } from './commands/helpers.js';
import { helpEntries } from './commands/help-entries.js';
import { config } from './config.js';
import { createAuditEmbed, sendLogMessage } from './logging.js';

// ─── Validación del token ─────────────────────────────────────────────────────

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token) {
  console.error('[ERROR] Falta la variable DISCORD_TOKEN en el archivo .env');
  process.exit(1);
}

if (!clientId) {
  console.error('[ERROR] Falta la variable CLIENT_ID en el archivo .env');
  process.exit(1);
}

// ─── Cliente ──────────────────────────────────────────────────────────────────

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ]
});

// ─── Validación de comandos ──────────────────────────────────────────────────

function validateCommands() {
  const errors = [];
  const names = new Set();

  for (const [index, cmd] of slashCommands.entries()) {
    if (!cmd.data || typeof cmd.data.toJSON !== 'function') {
      errors.push(`Comando ${index}: falta propiedad 'data' o no es un SlashCommandBuilder`);
      continue;
    }

    if (!cmd.execute || typeof cmd.execute !== 'function') {
      errors.push(`Comando ${index}: falta función 'execute'`);
      continue;
    }

    const name = cmd.data.name;
    if (!name) {
      errors.push(`Comando ${index}: falta nombre`);
      continue;
    }

    if (names.has(name)) {
      errors.push(`Comando ${index}: nombre duplicado '${name}'`);
      continue;
    }

    names.add(name);
  }

  if (errors.length > 0) {
    console.error('[ERROR] Errores de validación de comandos:');
    errors.forEach(error => console.error(`  - ${error}`));
    process.exit(1);
  }

  console.log(`[BOT] ✅ Validación exitosa: ${slashCommands.length} comandos`);
}

// ─── Registro de comandos slash ───────────────────────────────────────────────

const rest = new REST({ version: '10' }).setToken(token);

async function registerCommands() {
  try {
    const route = guildId
      ? Routes.applicationGuildCommands(clientId, guildId)
      : Routes.applicationCommands(clientId);

    console.log('[BOT] 📝 Registrando comandos slash en ' + (guildId ? `guild ${guildId}` : 'global'));

    const commandsData = slashCommands.map(cmd => {
      try {
        return cmd.data.toJSON();
      } catch (err) {
        console.error(`[ERROR] Error al convertir comando ${cmd.data?.name ?? 'desconocido'}:`, err);
        throw err;
      }
    });

    const start = Date.now();
    const result = await rest.put(
      route,
      { body: commandsData }
    );
    const elapsed = Date.now() - start;

    console.log(`[BOT] ✅ ${result.length} comandos slash registrados exitosamente en ${elapsed} ms.`);
    if (!guildId) {
      console.log('[BOT] ⚠️ Registro global. Puede tardar varios minutos en propagarse a Discord. Añade GUILD_ID en .env para obtener registro inmediato en un servidor de prueba.');
    }
  } catch (error) {
    console.error('[ERROR] Error al registrar comandos:', error.message);
    console.error(error);
  }
}

// ─── Actividades rotativas ────────────────────────────────────────────────────

const ACTIVITY_TYPE_MAP = {
  Playing:   ActivityType.Playing,
  Streaming: ActivityType.Streaming,
  Listening: ActivityType.Listening,
  Watching:  ActivityType.Watching,
  Competing: ActivityType.Competing,
};

let activityIndex = 0;

function setNextActivity(user) {
  try {
    const activity = config.activities[activityIndex % config.activities.length];
    user.setActivity(activity.text, {
      type: ACTIVITY_TYPE_MAP[activity.type] ?? ActivityType.Playing
    });
    activityIndex++;
  } catch (error) {
    console.error('[ERROR] Error al cambiar actividad:', error);
  }
}

// ─── Evento: Ready ────────────────────────────────────────────────────────────

client.once(Events.ClientReady, async (readyClient) => {
  const lines = [
    '┌─────────────────────────────────────┐',
    `│  🤖 Bot: ${readyClient.user.tag.padEnd(24)} │`,
    `│  📋 Comandos: ${String(slashCommands.length).padEnd(23)} │`,
    `│  🏠 Servidores: ${String(readyClient.guilds.cache.size).padEnd(21)} │`,
    '└─────────────────────────────────────┘',
  ];
  console.log(lines.join('\n'));

  // Validar comandos antes de registrar
  validateCommands();

  // Registrar comandos slash
  await registerCommands();

  // Actividad inicial
  setNextActivity(readyClient.user);

  // Rotación de actividades
  setInterval(() => {
    setNextActivity(readyClient.user);
  }, config.activityInterval);

  console.log(`[BOT] ✅ Bot listo y disponible`);
});

// ─── Evento: InteractionCreate ────────────────────────────────────────────────

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = slashCommands.find(cmd => cmd.data.name === interaction.commandName);
  if (!command) {
    console.warn(`[WARN] Comando desconocido: ${interaction.commandName}`);
    return;
  }

  try {
    console.log(`[CMD] ▶️ Ejecutando: /${interaction.commandName} por ${interaction.user.tag}`);
    
    await command.execute({
      interaction,
      config,
      client
    });
    
    console.log(`[CMD] ✅ Completado: /${interaction.commandName}`);
  } catch (error) {
    console.error(`[ERROR] Comando "${interaction.commandName}":`, error);

    const reply = {
      embeds: [{
        color: config.errorColor,
        title: '❌ Error',
        description: 'Ocurrió un error al ejecutar ese comando. Contacta con un administrador.',
        timestamp: new Date().toISOString(),
        footer: { text: config.footerText }
      }],
      ephemeral: true
    };

    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply);
      } else {
        await interaction.reply(reply);
      }
    } catch (replyError) {
      console.error('[ERROR] No se pudo enviar el mensaje de error:', replyError);
    }
  }
});

client.on(Events.GuildMemberAdd, async (member) => {
  const embed = createAuditEmbed('join', {
    description: `**${member.user.tag}** entró al servidor.`,
    fields: [{ name: 'Usuario', value: `<@${member.user.id}>`, inline: true }]
  });
  await sendLogMessage(member.guild, embed);
});

client.on(Events.GuildMemberRemove, async (member) => {
  const embed = createAuditEmbed('leave', {
    description: `**${member.user.tag}** salió del servidor.`,
    fields: [{ name: 'Usuario', value: `<@${member.user.id}>`, inline: true }]
  });
  await sendLogMessage(member.guild, embed);
});

// ─── Manejo de errores ────────────────────────────────────────────────────────

client.on(Events.Error, (error) => {
  console.error('[DISCORD ERROR]', error);
});

client.on(Events.Warn, (warning) => {
  console.warn('[DISCORD WARN]', warning);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[UNCAUGHT EXCEPTION]', error);
  process.exit(1);
});

// ─── Login ────────────────────────────────────────────────────────────────────

client.login(token);