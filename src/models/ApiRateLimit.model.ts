import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

export interface IApiRateLimit {
  id: string;
  ip: string;
  username: string | null;
  attemptCount: number;
  blockCount: number | null;
  blockedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ApiRateLimitCreationAttributes extends Optional<IApiRateLimit, 'id'> {}

export class ApiRateLimit extends Model<IApiRateLimit, ApiRateLimitCreationAttributes> implements IApiRateLimit {
  public id!: string;
  public ip!: string;
  public username!: string;
  public attemptCount!: number;
  public blockCount!: number | 0;
  public blockedUntil!: Date | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ApiRateLimit.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    ip: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    attemptCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    blockCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    blockedUntil: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    }
  },
  {
    sequelize,
    modelName: 'ApiRateLimit',
    tableName: 'api_rate_limits',
    timestamps: true
  }
);

export default ApiRateLimit;