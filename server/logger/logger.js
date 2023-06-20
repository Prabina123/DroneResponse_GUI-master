const { createLogger, format, transports } = require('winston');

const enumerateErrorFormat = format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

const logger = createLogger({
  // level: config.env === LogEnv.dev ? LogLevel.debug : LogLevel.info,
  level: 'debug',
  format: format.combine(
    enumerateErrorFormat(),
    // config.env === LogEnv.dev ? format.colorize() : format.uncolorize(),
    format.colorize(),
    format.splat(),
    format.printf(({ level, message }) => `${level}: ${message}`)
  ),
  transports: [
    new transports.Console({
      stderrLevels: ['debug'],
    }),

    new transports.File({ dirname: 'logs', filename: 'error.log', level: 'error' }),

    new transports.File({ dirname: 'logs', filename: 'server.log', level: 'debug' })
  ],

  
});

// if (process.env.NODE_ENV !== 'production') {
//   logger.add(new transports.Console({
//     format: format.simple(),
//   }));
// }

module.exports = logger;