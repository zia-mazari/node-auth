import { Model, DataTypes, Optional, HasOneCreateAssociationMixin } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database.config';
import { IUser } from '../types/user.types';
import { UserDetail } from './UserDetail.model';

interface UserCreationAttributes extends Optional<IUser, 'id'> {}

export class User extends Model<IUser, UserCreationAttributes> implements IUser {
  public id!: string;
  public username!: string;
  public email!: string;
  public password!: string;
  public is_verified!: boolean;

  // Association methods
  public createUserDetail!: HasOneCreateAssociationMixin<UserDetail>;
  public readonly user_detail?: UserDetail;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
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
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: true
  }
);

// Define the association
User.hasOne(UserDetail, {
  sourceKey: 'id',
  foreignKey: 'user_id',
  as: 'user_detail'
});

UserDetail.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Hash password before saving
User.beforeCreate(async (user: User) => {
  const hashedPassword = await bcrypt.hash(user.password, 10);
  user.password = hashedPassword;
});

User.beforeUpdate(async (user: User) => {
  if (user.changed('password')) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
  }
});

export default User;
