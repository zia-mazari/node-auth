import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

export interface IEmailVerification {
  id: string;
  userId: string;
  verificationCode: string;
  expiresAt: Date;
  attempts: number;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface EmailVerificationCreationAttributes extends Optional<IEmailVerification, 'id' | 'attempts' | 'verified'> {}

export class EmailVerification extends Model<IEmailVerification, EmailVerificationCreationAttributes> implements IEmailVerification {
  public id!: string;
  public userId!: string;
  public verificationCode!: string;
  public expiresAt!: Date;
  public attempts!: number;
  public verified!: boolean;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

EmailVerification.init(
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

    verificationCode: {
      type: DataTypes.STRING(6),
      allowNull: false
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 10
      }
    },
    verified: {
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
    modelName: 'EmailVerification',
    tableName: 'user_email_verifications',
    timestamps: true,
    indexes: [
      {
        fields: ['verificationCode']
      }
    ]
  }
);

export default EmailVerification;