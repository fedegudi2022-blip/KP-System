# KP-System — Bot de Discord completo con Node.js

Proyecto de bot de Discord con comandos slash, base de datos SQLite, moderación avanzada, logs robustos y ayuda interactiva.

## Qué incluye

- Registro automático de comandos slash
- Validación de comandos antes del registro
- Persistencia con SQLite en `data/bot.sqlite`
- Sistema de cooldowns y permisos centralizados
- Logs auditables en canal configurable
- Automoderación básica contra spam, links de invitación y lenguaje inapropiado
- Comando `/ayuda` interactivo con botones
- Estructura modular y fácil de extender

## Comandos disponibles

### 🔧 Utiles
- `/ayuda` - Muestra un panel organizado con botones
- `/ping` - Mide la latencia del bot
- `/hora` - Muestra la hora según la zona configurada
- `/info` - Información general del bot
- `/uptime` - Tiempo que lleva encendido el bot
- `/servidor` - Información del servidor actual
- `/usuario` - Información de un usuario
- `/avatar` - Muestra el avatar de un usuario
- `/calc` - Calculadora matemática
- `/embed` - Envía un embed personalizado
- `/poll` - Crea una encuesta rápida
- `/setrecordatorio` - Configura recordatorios

### 🛡️ Moderación
- `/setlog` - Configura el canal de logs
- `/warn` - Advierte a un usuario
- `/infractions` - Muestra las infracciones de un usuario
- `/clearwarns` - Limpia advertencias de un usuario
- `/ban` - Banea a un usuario
- `/kick` - Expulsa a un usuario
- `/mute` - Silencia a un usuario
- `/unmute` - Quita el silencio a un usuario

### 🎲 Diversión
- `/dado` - Lanza un dado
- `/moneda` - Lanza una moneda al aire
- `/bola8` - Pregunta a la bola mágica
- `/hola` - Saluda al bot
- `/poll` - Crea una encuesta rápida

### 🚫 Peligrosos
- `/decir` - Hace que el bot diga un mensaje
- `/nuke` - Borra mensajes en el canal actual

## Requisitos

- Node.js 24.15.0 o superior
- Token de bot de Discord
- Permisos de bot adecuados para moderación y mensajes

## Instalación

1. Abre la carpeta del proyecto en Visual Studio Code.
2. Instala las dependencias:

```bash
npm install
```

## Archivo `.env`

Duplica `.env.example` como `.env` y completa los valores:

```env
DISCORD_TOKEN=tu_token_real
CLIENT_ID=tu_client_id
GUILD_ID=optional_guild_id_for_fast_command_registration
TIMEZONE=America/Argentina/Buenos_Aires
LOCALE=es-AR
FOOTER_TEXT=KP-System Bot
BOT_STATUS=/ayuda para ver comandos
DEFAULT_COOLDOWN=5
```

- `DISCORD_TOKEN` es obligatorio.
- `CLIENT_ID` se usa para registrar comandos slash.
- `GUILD_ID` es opcional, pero acelera los registros en un servidor de prueba.
- `DEFAULT_COOLDOWN` controla los segundos de cooldown general entre comandos.

## Ejecución

Modo normal:

```bash
npm start
```

Modo desarrollo:

```bash
npm run dev
```

## Uso en Railway

Para desplegar en Railway desde GitHub:

1. Conecta el repositorio a Railway.
2. Configura las variables de entorno desde la UI de Railway.
3. Define el comando de inicio como `npm start`.
4. Asegúrate de habilitar almacenamiento persistente para `data/bot.sqlite` si quieres mantener los datos entre reinicios.

> Nota: SQLite es conveniente para desarrollo y servidores pequeños. En producción, considera usar PostgreSQL o MongoDB como almacenamiento persistente en Railway.

## Cómo invitar el bot

En `OAuth2 > URL Generator` selecciona `bot` y los permisos:

- `Send Messages`
- `Read Message History`
- `View Channels`
- `Embed Links`
- `Use Slash Commands`
- `Manage Messages`
- `Ban Members`
- `Kick Members`
- `Moderate Members`

## Estructura del proyecto

```text
src/
  commands.js
  config.js
  index.js
  logging.js
  storage/
    database.js
    logChannels.js
    warns.js
  utils/
    automod.js
    command-guard.js
    cooldowns.js
    time.js
  commands/
    ayuda.js
    ban.js
    bola8.js
    calc.js
    clearwarns.js
    dado.js
    decir.js
    embed.js
    help-entries.js
    helpers.js
    hola.js
    hora.js
    index.js
    info.js
    infractions.js
    kick.js
    limpiar.js
    moneda.js
    mute.js
    nuke.js
    ping.js
    poll.js
    servidor.js
    setlog.js
    setrecordatorio.js
    unban.js
    unmute.js
    uptime.js
    usuario.js
    warn.js
```

## Notas importantes

- El bot usa comandos slash, no prefijos.
- El archivo de base de datos queda en `data/bot.sqlite`.
- Si cambias comandos, reinicia el bot para volver a registrar cambios.
- La ayuda ahora funciona con botones para navegar por categorías.
