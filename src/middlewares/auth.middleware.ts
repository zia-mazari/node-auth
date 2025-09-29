import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import httpStatus from 'http-status';
import { RequestWithUser, RequestWithToken, TokenPayload } from '../types/express.types';

dotenv.config();

// Middleware function to authenticate JWT token
export const authenticateToken = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<Response | void> => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Invalid Authorization header format' });
  }
  
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Missing token' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Extract user ID from payload
    const userId = payload.userId;
    
    if (!userId) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Invalid token - missing user ID' });
    }
    
    // Attach user data to request
    req.user = {
      id: userId
    };
    
    // Also attach the full token payload for debugging
    req.tokenPayload = payload;
    
    next();
  } catch (err) {
    console.error('AUTH MIDDLEWARE - Token verification error:', err);
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Token expired' });
    }
    return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
  }
};

// Middleware function to authenticate refresh token
export const authenticateRefreshToken = (req: RequestWithToken, res: Response, next: NextFunction): Response | void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Invalid Authorization header format' });
  }
  
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Missing token' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as any;
    
    // Extract user ID from payload
    const userId = payload.userId;
    
    if (!userId) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Invalid token - missing user ID' });
    }
    
    // Attach the full token payload
    req.tokenPayload = payload;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Token expired' });
    }
    return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
  }
};

