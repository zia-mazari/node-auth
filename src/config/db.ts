import { Sequelize } from 'sequelize';
import config from './sequelize.config';
import { IDatabaseConfig } from '../types/database.types';

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env as keyof typeof config] as IDatabaseConfig;

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: false // Set to console.log to see SQL queries
  }
);

export default sequelize;