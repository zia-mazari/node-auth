export interface IUserDetail {
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

export interface IUser {
  id: string;
  username: string;
  email: string;
  password: string;
  role: string;
  isVerified: boolean;
  userDetail?: IUserDetail;
  createdAt?: Date;
  updatedAt?: Date;
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