export interface IDatabaseConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  dialect: 'postgres';
  port?: number;
  logging?: boolean | ((sql: string, timing?: number) => void);
  pool?: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
}

export interface ISequelizeConfig {
  development: IDatabaseConfig;
  test: IDatabaseConfig;
  production: IDatabaseConfig;
}