export const config = {
  timeZone:     process.env.TIMEZONE     ?? 'America/Argentina/Buenos_Aires',
  locale:       process.env.LOCALE       ?? 'es-AR',

  // Colores - Paleta Verde 🟢
  embedColor:   0x22c55e,   // Verde principal (brillante)
  successColor: 0x16a34a,   // Verde oscuro para éxitos
  errorColor:   0xdc2626,   // Rojo para errores
  warningColor: 0xeab308,   // Amarillo para advertencias
  infoColor:    0x10b981,   // Verde esmeralda para info

  // Footer de todos los embeds
  footerText:   process.env.FOOTER_TEXT  ?? 'KP-System Bot',

  // Actividades del bot (se rotan automáticamente)
  activities: [
    { text: process.env.BOT_STATUS ?? '/ayuda (con)', type: 'Listening' },
    { text: 'Viendo los mensajes!', type: 'Watching' },
    { text: '/ping (para ver mi latencia)', type: 'Listening' },
  ],

  // Cada cuántos ms rotar la actividad (5 minutos)
  activityInterval: 5 * 60 * 1000,
};