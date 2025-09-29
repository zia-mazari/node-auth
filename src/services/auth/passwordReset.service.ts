import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import User from '../../models/User.model';
import PasswordResetToken from '../../models/PasswordResetToken.model';
import { ApiHelper, HttpStatus } from '../../utils/helpers/api.helper';
import RateLimitService from '../api/rateLimit.service';

export class PasswordResetService {
  /**
   * Generate and send password reset token via email
   * 
   * @param email - User's email address
   * @param req - Express request object
   * @param res - Express response object
   * @returns Promise<void>
   */
  static async requestPasswordReset(email: string, req: Request, res: Response): Promise<void> {
    try {
      // Get client IP address
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

      // Check rate limiting for password reset requests (separate from login rate limiting)
      const rateLimitCheck = await RateLimitService.checkPasswordResetRateLimit(clientIp, email);
      if (rateLimitCheck.blocked) {
        return ApiHelper.tooManyRequests(res, rateLimitCheck.message, {
          blockedUntil: rateLimitCheck.blockedUntil,
          durationMs: rateLimitCheck.durationMs
        });
      }

      // Find user by email
      const user = await User.findOne({ where: { email } });
      
      // Always return success message for security (don't reveal if email exists)
      // But only send email if user actually exists
      if (user) {
        // First, clean up expired tokens for this user
        const deletedCount = await PasswordResetToken.destroy({
          where: { 
            userId: user.id,
            expiresAt: { [require('sequelize').Op.lt]: new Date() }
          }
        });
        
        // Cleanup completed silently

        // Check current active tokens for this user
        const activeTokens = await PasswordResetToken.findAll({
          where: { 
            userId: user.id, 
            used: false,
            expiresAt: { [require('sequelize').Op.gt]: new Date() }
          },
          order: [['createdAt', 'ASC']] // Oldest first
        });

        // If we have 3 or more active tokens, delete the oldest ones to keep only 2
        if (activeTokens.length >= 3) {
          const tokensToDelete = activeTokens.slice(0, activeTokens.length - 2);
          const tokenIdsToDelete = tokensToDelete.map(token => token.id);
          
          await PasswordResetToken.destroy({
            where: { id: tokenIdsToDelete }
          });
        }

        // Generate 6-digit reset code
        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Token expires in 15 minutes (more secure with shorter codes)
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // Create password reset token record
        await PasswordResetToken.create({
          userId: user.id,
          email: user.email,
          verificationCode: resetToken,
          expiresAt,
          used: false
        });

        // Token generated successfully
        
        // In production, you would use a service like SendGrid, Nodemailer, etc.
        // await this.sendPasswordResetEmail(user.email, resetToken, req);
      }

      // Record the password reset request for rate limiting
      await RateLimitService.recordPasswordResetAttempt(clientIp, email);

      // Always return success message (security best practice)
      return ApiHelper.success(res, 'PASSWORD_RESET_EMAIL_SENT', {
        message: 'If an account with that email exists, a password reset verification code has been sent.'
      });

    } catch (error) {
      console.error('PASSWORD RESET SERVICE - Request reset error:', error);
      return ApiHelper.error(res, 'PASSWORD_RESET_REQUEST_FAILED', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Reset password using valid token
   * 
   * @param token - Password reset token
   * @param newPassword - New password
   * @param req - Express request object
   * @param res - Express response object
   * @returns Promise<void>
   */
  static async resetPassword(token: string, newPassword: string, req: Request, res: Response): Promise<void> {
    try {
      // Get client IP address
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

      // Clean up expired tokens before processing
      await PasswordResetToken.destroy({
        where: { 
          expiresAt: { [require('sequelize').Op.lt]: new Date() }
        }
      });

      // Find valid, unused token
      const resetToken = await PasswordResetToken.findOne({
        where: {
          verificationCode: token,
          used: false,
          expiresAt: { [require('sequelize').Op.gt]: new Date() }
        },
        include: [{
          model: User,
          as: 'user'
        }]
      });

      if (!resetToken) {
        // Check if user+IP is blocked for wrong attempts
        const blockCheck = await RateLimitService.checkPasswordResetFailureBlock(clientIp, 'unknown');
        if (blockCheck.blocked) {
          return ApiHelper.tooManyRequests(res, blockCheck.message, {
            blockedUntil: blockCheck.blockedUntil,
            durationMs: blockCheck.durationMs
          });
        }

        // Record failed attempt (we don't know the email yet, so use 'unknown')
        // In a real scenario, you might want to pass email as a parameter
        await RateLimitService.recordPasswordResetFailure(clientIp, 'unknown');

        return ApiHelper.badRequest(res, 'INVALID_OR_EXPIRED_TOKEN', {
          message: 'Password reset token is invalid or has expired.'
        });
      }

      // Check if user+IP is blocked for wrong attempts (now we know the email)
      const blockCheck = await RateLimitService.checkPasswordResetFailureBlock(clientIp, resetToken.email);
      if (blockCheck.blocked) {
        return ApiHelper.tooManyRequests(res, blockCheck.message, {
          blockedUntil: blockCheck.blockedUntil,
          durationMs: blockCheck.durationMs
        });
      }

      // Find the user
      const user = await User.findByPk(resetToken.userId);
      if (!user) {
        return ApiHelper.badRequest(res, 'USER_NOT_FOUND');
      }

      // Hash the new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update user's password
      await user.update({ password: hashedPassword });

      // Mark token as used
      await resetToken.update({ used: true });

      // Clear any existing rate limit records for this user (fresh start after password reset)
      await RateLimitService.clear(clientIp, user.email);
      
      // Clear password reset failure records (fresh start after successful reset)
      await RateLimitService.clearPasswordResetFailures(clientIp, user.email);
      
      // Clear password reset request records (fresh start after successful reset)
      await RateLimitService.clearPasswordResetRequests(clientIp, user.email);

      // Delete ALL password reset tokens for this user after successful reset
      // This ensures no remaining tokens can be used and cleans up the database
      await PasswordResetToken.destroy({
        where: {
          userId: user.id
        }
      });

      return ApiHelper.success(res, 'PASSWORD_RESET_SUCCESSFUL', {
        message: 'Your password has been successfully reset. You can now log in with your new password.'
      });

    } catch (error) {
      console.error('PASSWORD RESET SERVICE - Reset password error:', error);
      return ApiHelper.error(res, 'PASSWORD_RESET_FAILED', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Validate password reset token (for frontend to check if token is valid)
   * 
   * @param token - Password reset token
   * @param req - Express request object
   * @param res - Express response object
   * @returns Promise<void>
   */
  static async validateResetToken(token: string, req: Request, res: Response): Promise<void> {
    try {
      // Clean up expired tokens before validation
      await PasswordResetToken.destroy({
        where: { 
          expiresAt: { [require('sequelize').Op.lt]: new Date() }
        }
      });

      const resetToken = await PasswordResetToken.findOne({
        where: {
          verificationCode: token,
          used: false,
          expiresAt: { [require('sequelize').Op.gt]: new Date() }
        }
      });

      if (!resetToken) {
        return ApiHelper.badRequest(res, 'INVALID_OR_EXPIRED_TOKEN', {
          message: 'Password reset token is invalid or has expired.',
          valid: false
        });
      }

      return ApiHelper.success(res, 'TOKEN_VALID', {
        message: 'Token is valid.',
        valid: true,
        email: resetToken.email
      });

    } catch (error) {
      console.error('PASSWORD RESET SERVICE - Validate token error:', error);
      return ApiHelper.error(res, 'TOKEN_VALIDATION_FAILED', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Send password reset email with verification code (placeholder for actual email service)
   * 
   * @param email - Recipient email
   * @param verificationCode - 6-digit verification code
   * @param req - Express request object
   * @private
   */
  private static async sendPasswordResetEmail(email: string, verificationCode: string, req: Request): Promise<void> {
    // TODO: Implement actual email sending
    // This is where you would integrate with SendGrid, Nodemailer, AWS SES, etc.
    
    // Email content should include the 6-digit verification code
    const emailContent = {
      to: email,
      subject: 'Password Reset Verification Code',
      text: `Your password reset verification code is: ${verificationCode}. This code will expire in 1 hour.`,
      html: `
        <h2>Password Reset Request</h2>
        <p>You have requested to reset your password. Please use the following verification code:</p>
        <h3 style="font-size: 24px; letter-spacing: 2px; color: #007bff;">${verificationCode}</h3>
        <p><strong>This code will expire in 1 hour.</strong></p>
        <p>If you did not request this password reset, please ignore this email.</p>
      `
    };
    
    // Email sending logic would be implemented here
    // Example: await emailService.send(emailContent);
    // For now, this is a placeholder for actual email service integration
  }
}

export default PasswordResetService;