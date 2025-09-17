import { Request } from 'express';
import { IUser } from './user.types';

export interface RequestWithUser extends Request {
  user?: {
    id: string;
  };
  tokenPayload?: TokenPayload;
}

export interface RequestWithToken extends Request {
  tokenPayload?: TokenPayload;
}

export interface TokenPayload {
  userId?: string;
  user_id?: string;
  username?: string;
  email?: string;
  iat?: number;
  exp?: number;
  token?: {
    type: string;
  };
}