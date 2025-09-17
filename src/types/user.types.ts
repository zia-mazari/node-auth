export interface IUserDetail {
  id: string;
  user_id: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  gender?: string;
  date_of_birth?: Date;
  phone_number?: string;
  profile_picture?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface IUser {
  id: string;
  username: string;
  email: string;
  password: string;
  is_verified: boolean;
  user_detail?: IUserDetail;
   created_at?: Date;
   updated_at?: Date;
}

export interface IUserInput extends Omit<IUser, 'id' | 'lastLogin' | 'createdAt' | 'updatedAt'> {
  confirmPassword?: string;
}

export interface IUserLogin {
  email: string;
  password: string;
}

export interface IPasswordUpdate {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  logout?: boolean;
}