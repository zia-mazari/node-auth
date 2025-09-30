import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

export interface IPasswordResetToken {
  id: string;
  userId: string;
  email: string;
  verificationCode: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PasswordResetTokenCreationAttributes extends Optional<IPasswordResetToken, 'id'> {}

export class PasswordResetToken extends Model<IPasswordResetToken, PasswordResetTokenCreationAttributes> implements IPasswordResetToken {
  public id!: string;
  public userId!: string;
  public email!: string;
  public verificationCode!: string;
  public expiresAt!: Date;
  public used!: boolean;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PasswordResetToken.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    verificationCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    used: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
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
    modelName: 'PasswordResetToken',
    tableName: 'auth_password_resets',
    timestamps: true,
    indexes: [
      {
        fields: ['verificationCode']
      },
      {
        fields: ['email']
      },
      {
        fields: ['userId']
      },
      {
        fields: ['expiresAt']
      }
    ]
  }
);

export default PasswordResetToken;