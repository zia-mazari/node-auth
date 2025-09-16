import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import httpStatus from 'http-status';

dotenv.config();

interface TokenPayload {
  user: {
    id: string;
  };
  token: {
    type: string;
    version: string;
  };
}

interface RequestWithToken extends Request {
  tokenPayload?: TokenPayload;
}

// Middleware function to authenticate JWT token
export const authenticateToken = async (req: RequestWithToken, res: Response, next: NextFunction): Promise<Response | void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Missing token' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    if (payload.token.type !== 'access') {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Invalid token type' });
    }
    req.tokenPayload = payload;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Token expired' });
    }
    return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
  }
};

// Middleware function to authenticate refresh token
export const authenticateRefreshToken = (req: RequestWithToken, res: Response, next: NextFunction): Response | void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Missing token' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    if (payload.token.type !== 'refresh') {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Invalid token type' });
    }
    req.tokenPayload = payload;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Token expired' });
    }
    return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
  }
};

