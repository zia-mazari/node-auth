import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';
import User from './User.model';

interface IUserDetail {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  gender?: string;
  date_of_birth?: Date;
  phone_number?: string;
  profile_picture?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface UserDetailCreationAttributes extends Optional<IUserDetail, 'id'> {}

export class UserDetail extends Model<IUserDetail, UserDetailCreationAttributes> implements IUserDetail {
  public id!: string;
  public user_id!: string;
  public first_name!: string;
  public last_name!: string;
  public gender!: string;
  public date_of_birth!: Date;
  public phone_number!: string;
  public profile_picture!: string;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

UserDetail.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },

    first_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: true,
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profile_picture: {
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