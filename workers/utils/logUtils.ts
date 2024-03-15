import winston from 'winston';
import 'winston-mongodb';

const { combine, timestamp, json, simple } = winston.format;

const log = winston.createLogger({
  level: 'info',
  format: combine(timestamp(), json()),
  transports: [
    new winston.transports.Console({ format: combine(timestamp(), simple()) }),
    new winston.transports.MongoDB({
      db: process.env.MONGO_CONNECTION_STRING as string,
      collection: 'log',
    }),
  ],
});

export default log;
