import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import httpStatus from 'http-status';
import { RequestWithUser, RequestWithToken, TokenPayload } from '../types/express.types';

dotenv.config();

// Middleware function to authenticate JWT token
export const authenticateToken = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<Response | void> => {
  console.log('AUTH MIDDLEWARE - Request headers:', JSON.stringify(req.headers));
  
  const authHeader = req.headers.authorization;
  console.log('AUTH MIDDLEWARE - Authorization header:', authHeader);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('AUTH MIDDLEWARE - Error: Invalid Authorization header format');
    return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Invalid Authorization header format' });
  }
  
  const token = authHeader.split(' ')[1];
  console.log('AUTH MIDDLEWARE - Extracted token:', token ? `${token.substring(0, 10)}...` : 'No token');

  if (!token) {
    console.log('AUTH MIDDLEWARE - Error: Missing token');
    return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Missing token' });
  }

  try {
    console.log('AUTH MIDDLEWARE - Verifying token with secret');
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    console.log('AUTH MIDDLEWARE - Token payload:', JSON.stringify(payload));
    
    // Extract user ID from payload (handles both formats)
    const userId = payload.user_id || payload.userId;
    
    if (!userId) {
      console.log('AUTH MIDDLEWARE - Error: No user ID in token. Full payload:', JSON.stringify(payload));
      return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Invalid token - missing user ID' });
    }
    
    // Attach user data to request
    req.user = {
      id: userId
    };
    
    // Also attach the full token payload for debugging
    req.tokenPayload = payload;
    
    console.log('AUTH MIDDLEWARE - Authentication successful, user ID:', userId);
    next();
  } catch (err) {
    console.log('AUTH MIDDLEWARE - Token verification error:', err);
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Token expired' });
    }
    return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
  }
};

// Middleware function to authenticate refresh token
export const authenticateRefreshToken = (req: RequestWithToken, res: Response, next: NextFunction): Response | void => {
  console.log('REFRESH TOKEN MIDDLEWARE - Request headers:', JSON.stringify(req.headers));
  
  const authHeader = req.headers.authorization;
  console.log('REFRESH TOKEN MIDDLEWARE - Authorization header:', authHeader);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('REFRESH TOKEN MIDDLEWARE - Error: Invalid Authorization header format');
    return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Invalid Authorization header format' });
  }
  
  const token = authHeader.split(' ')[1];
  console.log('REFRESH TOKEN MIDDLEWARE - Extracted token:', token ? `${token.substring(0, 10)}...` : 'No token');

  if (!token) {
    console.log('REFRESH TOKEN MIDDLEWARE - Error: Missing token');
    return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Missing token' });
  }

  try {
    console.log('REFRESH TOKEN MIDDLEWARE - Verifying token with secret');
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    console.log('REFRESH TOKEN MIDDLEWARE - Token payload:', JSON.stringify(payload));
    
    // Extract user ID from payload (handles both formats)
    const userId = payload.user_id || payload.userId;
    
    if (!userId) {
      console.log('REFRESH TOKEN MIDDLEWARE - Error: No user ID in token. Full payload:', JSON.stringify(payload));
      return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Invalid token - missing user ID' });
    }
    
    // Attach the full token payload
    req.tokenPayload = payload;
    next();
  } catch (err) {
    console.log('REFRESH TOKEN MIDDLEWARE - Token verification error:', err);
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Token expired' });
    }
    return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
  }
};

