import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.File({ filename: 'error.log', level: 'error' }));
  logger.add(new winston.transports.File({ filename: 'combined.log' }));
  logger.add(new winston.transports.Console({ format: winston.format.simple() }));
} else {
  logger.add(new winston.transports.Console({
    format: winston.format.json(),
  }));
}
