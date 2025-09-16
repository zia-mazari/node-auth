import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { User } from '../../models/User.model';

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export const generateAccessTokens = (user: User): TokenResponse => {
  const accessToken = jwt.sign(
    { userId: user.id, username: user.username },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    { userId: user.id, username: user.username, tokenId: uuidv4() },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): jwt.JwtPayload => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const verifyRefreshToken = (token: string): jwt.JwtPayload => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as jwt.JwtPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};