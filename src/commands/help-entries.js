export const helpEntries = [
  {
    name: 'ayuda',
    category: '📚 Ayuda',
    description: 'Muestra un panel organizado con los comandos disponibles y cómo usarlos.',
    usage: '/ayuda',
    details: 'Abre esta guía rápida con los comandos mejor explicados y sus ejemplos.'
  },
  {
    name: 'ping',
    category: '🔧 Utiles',
    description: 'Mide la latencia del bot y la API de Discord.',
    usage: '/ping',
    details: 'Útil para comprobar si el bot responde correctamente en el servidor.'
  },
  {
    name: 'hora',
    category: '🔧 Utiles',
    description: 'Muestra la hora actual según la zona configurada.',
    usage: '/hora',
    details: 'Devuelve la hora local del bot con la zona horaria configurada.'
  },
  {
    name: 'info',
    category: '🔧 Utiles',
    description: 'Muestra estadísticas e información general del bot.',
    usage: '/info',
    details: 'Incluye servidores, usuarios, uptime, memoria y ping de API.'
  },
  {
    name: 'uptime',
    category: '🔧 Utiles',
    description: 'Muestra cuánto tiempo lleva el bot en línea.',
    usage: '/uptime',
    details: 'Excelente para comprobar si hubo reinicios recientes.'
  },
  {
    name: 'servidor',
    category: '🔧 Utiles',
    description: 'Muestra información del servidor actual.',
    usage: '/servidor',
    details: 'Incluye canales, roles, verificación y fecha de creación.'
  },
  {
    name: 'usuario',
    category: '🔧 Utiles',
    description: 'Muestra información de un usuario del servidor.',
    usage: '/usuario [usuario]',
    details: 'Devuelve datos de la cuenta, roles y fecha de ingreso.'
  },
  {
    name: 'avatar',
    category: '🔧 Utiles',
    description: 'Muestra el avatar de un usuario.',
    usage: '/avatar [usuario]',
    details: 'Incluye un enlace directo para descargar el avatar a tamaño completo.'
  },
  {
    name: 'calc',
    category: '🔧 Utiles',
    description: 'Calcula una expresión matemática básica.',
    usage: '/calc <expresion>',
    details: 'Soporta + - * / % ^ y paréntesis para cálculos rápidos.'
  },
  {
    name: 'embed',
    category: '🔧 Utiles',
    description: 'Crea mensajes embed con título, URL, descripción y más.',
    usage: '/embed <titulo> [url] [subtitulo] [color] [pie] [imagen] [miniatura]',
    details: 'Genera un embed personalizado de forma rápida con opciones de formato.'
  },
  {
    name: 'setlog',
    category: '🛡️ Moderación',
    description: 'Configura el canal donde se envían los logs del servidor.',
    usage: '/setlog <canal>',
    details: 'Permite elegir un solo canal de logs para baneos, kicks, mutes y entradas/salidas.'
  },
  {
    name: 'warn',
    category: '🛡️ Moderación',
    description: 'Registra una advertencia a un usuario.',
    usage: '/warn <usuario> <razon>',
    details: 'Registra una infracción persistente y puede silenciar automáticamente después de varias advertencias.'
  },
  {
    name: 'infractions',
    category: '🛡️ Moderación',
    description: 'Muestra las infracciones de un usuario.',
    usage: '/infractions [usuario]',
    details: 'Lista las advertencias almacenadas para un usuario en este servidor.'
  },
  {
    name: 'clearwarns',
    category: '🛡️ Moderación',
    description: 'Elimina todas las advertencias de un usuario.',
    usage: '/clearwarns <usuario>',
    details: 'Limpia las advertencias persistentes registradas para ese usuario.'
  },
  {
    name: 'unban',
    category: '🛡️ Moderación',
    description: 'Quita el baneo a un usuario del servidor.',
    usage: '/unban <usuario> [razon]',
    details: 'Requiere permiso de Ban Members y registra la acción en el canal de logs.'
  },
  {
    name: 'limpiar',
    category: '🛡️ Moderación',
    description: 'Borra mensajes recientes del canal.',
    usage: '/limpiar <cantidad>',
    details: 'Requiere permiso de Manage Messages y borra hasta 100 mensajes.'
  },
  {
    name: 'ban',
    category: '🛡️ Moderación',
    description: 'Banea a un usuario del servidor.',
    usage: '/ban <usuario> [razon]',
    details: 'Requiere permiso de Ban Members y protege contra autobaneo.'
  },
  {
    name: 'kick',
    category: '🛡️ Moderación',
    description: 'Expulsa a un usuario del servidor.',
    usage: '/kick <usuario> [razon]',
    details: 'Requiere permiso de Kick Members y verifica que el usuario esté expulsable.'
  },
  {
    name: 'mute',
    category: '🛡️ Moderación',
    description: 'Silencia a un usuario por un tiempo limitado.',
    usage: '/mute <usuario> <minutos> [razon]',
    details: 'Requiere permiso de Moderate Members y aplica timeout al usuario.'
  },
  {
    name: 'unmute',
    category: '🛡️ Moderación',
    description: 'Quita el silencio a un usuario.',
    usage: '/unmute <usuario>',
    details: 'Requiere permiso de Moderate Members y verifica el estado de silencio.'
  },
  {
    name: 'dado',
    category: '🎲 Diversión',
    description: 'Lanza un dado personalizado.',
    usage: '/dado [caras]',
    details: 'Permite valores entre 2 y 1000 caras para juegos rápidos.'
  },
  {
    name: 'moneda',
    category: '🎲 Diversión',
    description: 'Lanza una moneda al aire.',
    usage: '/moneda',
    details: 'Resultado aleatorio entre Cara y Cruz con iconos claros.'
  },
  {
    name: 'bola8',
    category: '🎲 Diversión',
    description: 'Pregunta a la bola mágica.',
    usage: '/bola8 <pregunta>',
    details: 'Responde con 15 resultados posibles y añade un toque divertido.'
  },
  {
    name: 'hola',
    category: '🎲 Diversión',
    description: 'Saluda al bot.',
    usage: '/hola',
    details: 'El bot responde con saludos amigables y personalizados.'
  },
  {
    name: 'poll',
    category: '🎲 Diversión',
    description: 'Crea una encuesta rápida con reacciones.',
    usage: '/poll <pregunta> <opcion1> <opcion2> [opcion3] [opcion4] [opcion5]',
    details: 'El bot publica una encuesta y agrega reacciones numéricas para votar.'
  },
  {
    name: 'setrecordatorio',
    category: '🔧 Utiles',
    description: 'Configura un recordatorio periódico en este canal.',
    usage: '/setrecordatorio <minutos> <mensaje> [veces]',
    details: 'El bot repetirá tu mensaje cada intervalo en el canal donde lo configures.'
  },
  {
    name: 'decir',
    category: '🚫 Prohibido',
    description: 'Hace que el bot repita un mensaje.',
    usage: '/decir <mensaje>',
    details: 'Usar con cuidado: el bot envía el texto directamente por el canal.'
  },
  {
    name: 'nuke',
    category: '🚫 Prohibido',
    description: 'Borra todos los mensajes del canal.',
    usage: '/nuke',
    details: 'Requiere Administrador y borra mensajes en bloques hasta vaciar el canal.'
  }
];
