# KP-System — Bot de Discord completo con Node.js

Proyecto de bot de Discord listo para usar en Visual Studio Code con `Node.js 24.15.0+`, `discord.js 14` y comandos slash organizados.

## Qué incluye

- Registro automático de comandos slash
- Limpieza automática de comandos antiguos al iniciar
- Validación de comandos antes del registro
- Configuración de zona horaria y localización desde `.env`
- Embeds profesionales para respuestas
- Gestión de logs y canales de registro
- Comandos de moderación, utilidades y diversión
- Estructura modular en `src/commands`

## Comandos disponibles

### 🔧 Utiles
- `/ayuda` - Muestra el panel de ayuda
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
- `/limpiar` - Borra mensajes del canal
- `/ban` - Banea a un usuario
- `/unban` - Desbanea a un usuario
- `/kick` - Expulsa a un usuario
- `/mute` - Silencia a un usuario
- `/unmute` - Quita el silencio a un usuario
- `/warn` - Advierte a un usuario
- `/infractions` - Muestra las infracciones de un usuario
- `/clearwarns` - Limpia las advertencias de un usuario
- `/setlog` - Configura el canal de logs

### 🎲 Diversión
- `/dado` - Lanza un dado
- `/moneda` - Lanza una moneda al aire
- `/bola8` - Pregunta a la bola mágica
- `/hola` - Saluda al bot

### 🚫 Peligrosos
- `/decir` - Hace que el bot diga un mensaje
- `/nuke` - Borra TODOS los mensajes del canal (PELIGROSO)

## 1. Abrir el proyecto

Abre esta carpeta en Visual Studio Code.

## 2. Instalar dependencias

En la terminal del proyecto ejecuta:

```bash
npm install
```

## 3. Crear el archivo `.env`

Copia `.env.example` con el nombre `.env` y rellena los valores:

```env
DISCORD_TOKEN=tu_token_real
CLIENT_ID=tu_client_id
GUILD_ID=optional_guild_id_for_fast_command_registration
TIMEZONE=America/Argentina/Buenos_Aires
LOCALE=es-AR
FOOTER_TEXT=KP-System Bot
BOT_STATUS=/ayuda para ver comandos
```

- `GUILD_ID` es opcional, pero acelera el registro de comandos durante el desarrollo.
- `BOT_STATUS` define el estado que muestra el bot.

### Cómo obtener el `CLIENT_ID`

1. Ve a [Discord Developer Portal](https://discord.com/developers/applications)
2. Selecciona tu aplicación/bot
3. En la sección "General Information", copia el "Application ID"
4. Ese es tu `CLIENT_ID`

## 4. Ejecutar el bot

Modo normal:

```bash
npm start
```

Modo desarrollo:

```bash
npm run dev
```

El bot se conectará automáticamente y registrará los comandos slash en Discord.

## 5. Invitar el bot a tu servidor

En `OAuth2 > URL Generator` selecciona:

- `bot`

Y en permisos, al menos:

- `Send Messages`
- `Read Message History`
- `View Channels`
- `Embed Links`
- `Use Slash Commands`
- `Manage Messages` (para comandos de moderación)
- `Ban Members`
- `Kick Members`
- `Moderate Members` (para mute/unmute)

## Notas importantes

- Los comandos slash pueden tardar en aparecer en Discord tras el primer registro.
- Si modificas comandos, reinicia el bot para volver a registrar los cambios.
- Los comandos de moderación requieren permisos adecuados para el usuario y para el bot.

## Estructura del proyecto

```text
src/
  commands.js
  config.js
  index.js
  logging.js
  commands/
    avatar.js
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
  storage/
    logChannels.js
    warns.js
  utils/
    time.js
```

## Información adicional

- El bot usa comandos slash, no prefijos como `!`.
- La zona horaria se define con `TIMEZONE` en `.env`.
- `GUILD_ID` acelera el despliegue de comandos en un servidor de prueba.
