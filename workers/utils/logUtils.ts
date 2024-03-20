import winston from 'winston';
import 'winston-mongodb';

const { combine, timestamp, json, simple, metadata } = winston.format;

let mongoConnectionString = process.env.MONGO_CONNECTION_STRING as string;
const secret = process.env.MONGO_SECRET;
if (secret) {
  const url = process.env.MONGO_SERVER_URL as string;
  const user = JSON.parse(secret) as { username: string; password: string };
  mongoConnectionString = `mongodb://${user.username}:${user.password}@${url}`;
}

const log = winston.createLogger({
  level: 'info',
  format: combine(timestamp(), json(), metadata()),
  transports: [
    new winston.transports.Console({
      format: combine(timestamp(), simple(), metadata()),
    }),
    new winston.transports.MongoDB({
      db: mongoConnectionString,
      collection: 'log',
    }),
  ],
});

export default log;
