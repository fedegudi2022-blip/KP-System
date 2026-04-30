# KP-System Bot de Discord

Bienvenido a la documentación del bot `KP-System`, un bot de Discord modular creado con Node.js y Discord.js v14. Esta guía está pensada para subirla como wiki a GitHub y compartirla con tu comunidad.

---

## 📌 Descripción

`KP-System` es un bot de Discord diseñado para servidores en español, especialmente para comunidades argentinas. Incluye:

- comandos slash en español
- recordatorios persistentes con SQLite
- moderación con logs y confirmaciones
- ayuda interactiva con botones
- comandos de diversión y utilidades
- sistema de permisos y cooldowns centralizado

---

## 🚀 Requisitos

- Node.js 24 o superior
- Discord Token
- Opcional: `GUILD_ID` para registro rápido de comandos en un servidor de prueba
- Permisos del bot según los comandos que uses

---

## 🧩 Instalación

```bash
cd KP-System
npm install
```

Copia el archivo de ejemplo de entorno y completa los valores:

```bash
copy .env.example .env
```

Configura en `.env`:

```env
DISCORD_TOKEN=tu_token_real
CLIENT_ID=tu_client_id
GUILD_ID=opcional_guild_id_para_pruebas
TIMEZONE=America/Argentina/Buenos_Aires
LOCALE=es-AR
FOOTER_TEXT=KP-System Bot
BOT_STATUS=/ayuda para ver comandos
DEFAULT_COOLDOWN=5
```

---

## ▶️ Ejecución

### Modo normal

```bash
npm start
```

### Modo desarrollo

```bash
npm run dev
```

---

## 🗂 Estructura del proyecto

- `src/` - código principal del bot
  - `src/commands/` - comandos slash
  - `src/storage/` - persistencia SQLite y configuraciones
  - `src/utils/` - utilidades, confirmaciones, guardias, recordatorios
  - `src/config.js` - configuración de colores, permisos y bot
- `data/` - archivos generados de datos y base de datos SQLite

---

## 🧠 Características principales

- Comandos completamente en español
- Recordatorios persistentes restaurados después de reinicios
- Logs de moderación en canal configurable
- Comando `/ayuda` con navegación por categorías
- Validaciones de permisos y confirmaciones para acciones peligrosas

---

## 📚 Comandos disponibles

### 🔧 Utiles
- `/ayuda` - muestra el menú de ayuda interactivo
- `/latencia` - mide la latencia del bot y la API
- `/hora` - devuelve la hora actual
- `/informacion` - muestra información general del bot
- `/tiempo` - muestra el uptime del bot
- `/servidor` - información del servidor actual
- `/usuario` - información detallada de un usuario
- `/avatar` - muestra el avatar de un usuario
- `/calc` - calcula expresiones matemáticas
- `/crearembed` - crea un embed personalizado
- `/encuesta` - crea una encuesta con reacciones
- `/setrecordatorio` - programa un recordatorio periódico
- `/listrecordatorios` - lista tus recordatorios activos
- `/recordatorioinfo` - muestra detalles de un recordatorio
- `/cancelarrecordatorio` - elimina un recordatorio activo

### 🛡️ Moderación
- `/configlog` - configura el canal de logs
- `/advertir` - registra una advertencia a un usuario
- `/infracciones` - muestra las infracciones de un usuario
- `/limpiaradvertencias` - elimina todas las advertencias de un usuario
- `/banear` - banea a un usuario del servidor
- `/expulsar` - expulsa a un usuario del servidor
- `/silenciar` - silencia a un usuario temporalmente
- `/desilenciar` - quita el silencio a un usuario
- `/limpiar` - borra mensajes recientes del canal

### 🎲 Diversión
- `/dado` - lanza un dado personalizado
- `/moneda` - lanza una moneda al aire
- `/bola8` - pregunta a la bola 8 mágica
- `/hola` - saluda al bot

### 🚫 Comandos peligrosos
- `/decir` - hace que el bot repita un mensaje
- `/borrartodo` - borra mensajes del canal en bloques

---

## 💾 Persistencia de recordatorios

Los recordatorios se guardan en SQLite dentro de `data/bot.sqlite` y se restauran automáticamente después de cada reinicio.

### Funcionalidades de recordatorios
- `minutos` de intervalo
- `mensaje` personalizado
- cantidad de `veces` a repetir
- gestión de recordatorios con `/listrecordatorios`, `/recordatorioinfo` y `/cancelarrecordatorio`

---

## 🔧 Configuración de logs

El comando `/configlog` permite definir un canal de logs donde se envían eventos como:

- baneos
- expulsiones
- silencios
- des-silenciados
- advertencias
- nuke
- cambios importantes con avisos de auditoría

---

## ⚠️ Permisos recomendados del bot

El bot debe tener al menos los siguientes permisos:

- Enviar mensajes
- Ver canales
- Historial de mensajes
- Insertar enlaces
- Usar comandos de aplicación
- Administrar mensajes (para `/limpiar` y `/borrartodo`)
- Banear miembros
- Expulsar miembros
- Moderar miembros

---

## ☑️ Personalización rápida

- Cambia `BOT_STATUS` en `.env` para actualizar el estado del bot.
- Ajusta `FOOTER_TEXT` para cambiar el pie de todos los embeds.
- Usa `TIMEZONE=America/Argentina/Buenos_Aires` para zona horaria local.

---

## 🌐 Despliegue en GitHub / Railway

### Railway
1. Conecta el repositorio a Railway.
2. Configura variables de entorno.
3. Define el comando de inicio como `npm start`.
4. Asegura almacenamiento persistente para `data/bot.sqlite`.

### GitHub
- Usa este archivo como wiki o doc principal.
- Puedes copiar la estructura de este `WIKI.md` a la wiki de GitHub en varias páginas.

---

## 🛠️ Buenas prácticas

- Siempre reinicia el bot al cambiar comandos.
- No compartas tu `DISCORD_TOKEN` públicamente.
- Haz backup de `data/bot.sqlite` si usas en producción.
- Usa `GUILD_ID` para registrar comandos rápidamente en un servidor de prueba.

---

## 📞 Soporte

Si necesitás ayuda, podés extender este repositorio con más comandos, mejoras de idioma, o migrar a otro motor de base de datos cuando el servidor crezca.

¡Listo! Esta guía está preparada para subirla a la wiki de GitHub o usarla como documentación general del proyecto.
