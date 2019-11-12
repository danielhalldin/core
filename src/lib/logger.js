import config from '../config';
import { createLogger, format, transports } from 'winston';
const { combine, printf } = format;

const myFormat = printf(info => {
  return `${info.timestamp} ${info.level}: ${info.message}`;
});

const logger = createLogger({
  format: combine(
    format.colorize(),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.prettyPrint(),
    myFormat
  ),
  transports: [new transports.Console()],
  level: config.logLevel
});

export default logger;
