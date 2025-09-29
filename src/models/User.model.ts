import { Model, DataTypes, Optional, HasOneCreateAssociationMixin, HasManyCreateAssociationMixin } from 'sequelize';
import { sequelize } from '../config/database.config';
import { IUser } from '../types/user.types';
import { UserDetail } from './UserDetail.model';
import { PasswordResetToken } from './PasswordResetToken.model';
import { hashPassword } from '../utils/helpers/password.helper';

interface UserCreationAttributes extends Optional<IUser, 'id'> {}

export class User extends Model<IUser, UserCreationAttributes> implements IUser {
  public id!: string;
  public username!: string;
  public email!: string;
  public password!: string;
  public isVerified!: boolean;

  // Association methods
  public createUserDetail!: HasOneCreateAssociationMixin<UserDetail>;
  public readonly userDetail?: UserDetail;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: false
  }
);

// Define the association
User.hasOne(UserDetail, {
  sourceKey: 'id',
  foreignKey: 'userId',
  as: 'userDetail'
});

UserDetail.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Define PasswordResetToken associations
User.hasMany(PasswordResetToken, {
  sourceKey: 'id',
  foreignKey: 'userId',
  as: 'passwordResetTokens'
});

PasswordResetToken.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Hash password before saving
User.beforeCreate(async (user: User) => {
  user.password = await hashPassword(user.password);
});

User.beforeUpdate(async (user: User) => {
  if (user.changed('password')) {
    user.password = await hashPassword(user.password);
  }
});

export default User;
