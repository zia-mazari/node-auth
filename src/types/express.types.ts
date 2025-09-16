import { Request } from 'express';
import { IUser } from './user.types';

export interface RequestWithUser extends Request {
  user?: IUser;
}

export interface TokenPayload {
  userId: string;
  username: string;
  iat?: number;
  exp?: number;
}