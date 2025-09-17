import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';
import User from './User.model';

interface IUserDetail {
  id: string;
  userId: string;
  secondaryEmail?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  phoneNumber?: string;
  profilePicture?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserDetailCreationAttributes extends Optional<IUserDetail, 'id'> {}

export class UserDetail extends Model<IUserDetail, UserDetailCreationAttributes> implements IUserDetail {
  public id!: string;
  public userId!: string;
  public secondaryEmail!: string;
  public firstName!: string;
  public middleName!: string;
  public lastName!: string;
  public dateOfBirth!: Date;
  public phoneNumber!: string;
  public profilePicture!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserDetail.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    secondaryEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    middleName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'UserDetail',
    tableName: 'user_details',
    underscored: true
  }
);

export default UserDetail;