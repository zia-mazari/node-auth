import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import User from '../../models/User.model';
import { IUserLogin } from '../../types/user.types';
import { ApiHelper, HttpStatus } from '../../utils/helpers/api.helper';
import RateLimitService from '../../services/api/rateLimit.service';
import rateLimitConfig from '../../config/rate-limit.config';

export class LoginService {
  /**
   * Authenticate a user and send API response
   * 
   * @param loginData - User's login credentials
   * @param req - Express request object
   * @param res - Express response object
   * @returns Promise<void>
   * 
   * @description
   * Validates user credentials and generates authentication token.
   * Sends appropriate API response.
   */
  static async login(loginData: IUserLogin, req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = loginData;
      
      // Get client IP address
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

      // Check if currently blocked
      const blockCheck = await RateLimitService.isBlocked(clientIp, email);
      
      // For repeat offenders (blockCount >= maxBlockCount), don't waste resources checking credentials
      if (blockCheck.blocked) {
        const stats = await RateLimitService.getStats(clientIp, email);
        if (stats && stats.blockCount >= rateLimitConfig.maxBlockCount) {
          // High-risk user - don't check credentials, just track blocked attempt
          await RateLimitService.recordBlockedAttempt(clientIp, email);
          return ApiHelper.unauthorized(res, blockCheck.message, { 
            blockedUntil: blockCheck.blockedUntil, 
            durationMs: blockCheck.durationMs 
          });
        }
      }
      
      // Find user and validate credentials (for first-time blocks or non-blocked users)
      const user = await User.findOne({ where: { email } });
      if (!user) {
        // User doesn't exist - handle rate limiting for failed attempt
        if (blockCheck.blocked) {
          await RateLimitService.recordBlockedAttempt(clientIp, email);
          return ApiHelper.unauthorized(res, blockCheck.message, { blockedUntil: blockCheck.blockedUntil, durationMs: blockCheck.durationMs });
        }
        
        const rate = await RateLimitService.recordFailedAttempt(clientIp, email);
        if (rate.blocked) {
          return ApiHelper.unauthorized(res, rate.message, { blockedUntil: rate.blockedUntil, durationMs: rate.durationMs });
        }
        return ApiHelper.unauthorized(res);
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        // Wrong password - handle rate limiting for failed attempt
        if (blockCheck.blocked) {
          await RateLimitService.recordBlockedAttempt(clientIp, email);
          return ApiHelper.unauthorized(res, blockCheck.message, { blockedUntil: blockCheck.blockedUntil, durationMs: blockCheck.durationMs });
        }
        
        const rate = await RateLimitService.recordFailedAttempt(clientIp, email);
        if (rate.blocked) {
          return ApiHelper.unauthorized(res, rate.message, { blockedUntil: rate.blockedUntil, durationMs: rate.durationMs });
        }
        return ApiHelper.unauthorized(res);
      }

      // Correct credentials! Handle based on block status
      if (blockCheck.blocked) {
        // Reset attemptCount (they proved they know the password) but keep block active
        await RateLimitService.resetAttemptCount(clientIp, email);
        // Still return block message - user must wait for block period to end
        return ApiHelper.unauthorized(res, blockCheck.message, { 
          blockedUntil: blockCheck.blockedUntil, 
          durationMs: blockCheck.durationMs 
        });
      }

      // User authenticated successfully and not blocked
      const tokenPayload = { 
        userId: user.id, 
        username: user.username,
        email: user.email
      };
      
      // Generate token
      const token = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET!,
        { expiresIn: rateLimitConfig.jwt.tokenExpiration }
      );

      // Clear rate limit record for successful login when not blocked
      await RateLimitService.clear(clientIp, email);

      return ApiHelper.success(res, 'LOGIN_SUCCESSFUL', { token });
    } catch (error) {
      console.error('AUTH SERVICE - Login error:', error);
      return ApiHelper.error(res, 'LOGIN_FAILED', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}