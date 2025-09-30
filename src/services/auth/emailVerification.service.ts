import { User } from '../../models/User.model';
import { EmailVerification } from '../../models/EmailVerification.model';
import EmailService from '../email/email.service';
import { Op } from 'sequelize';

export class EmailVerificationService {
  private static readonly CODE_EXPIRY_MINUTES = parseInt(process.env.EMAIL_VERIFICATION_CODE_EXPIRY || '15');
  private static readonly MAX_ATTEMPTS = parseInt(process.env.MAX_VERIFICATION_ATTEMPTS || '3');
  private static readonly CODE_LENGTH = parseInt(process.env.EMAIL_VERIFICATION_CODE_LENGTH || '6');

  /**
   * Generate a 6-digit verification code
   */
  private static generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send verification email with 6-digit code (always replaces existing code)
   */
  static async sendVerificationEmail(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check if user exists and get their email
      const user = await User.findByPk(userId);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      // Check if user is already verified
      if (user.isVerified) {
        return { success: false, message: 'Email is already verified' };
      }

      // Remove any existing verification codes for this user
      await EmailVerification.destroy({
        where: {
          userId,
          verified: false
        }
      });

      // Generate new verification code
      const code = this.generateCode();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + this.CODE_EXPIRY_MINUTES);

      // Store verification code in database
      await EmailVerification.create({
        userId,
        verificationCode: code,
        expiresAt,
        attempts: 0,
        verified: false
      });

      // Send email
      await EmailService.sendVerificationEmail(user.email, code);

      return { 
        success: true, 
        message: `Verification code sent to ${user.email}. Code expires in ${this.CODE_EXPIRY_MINUTES} minutes.` 
      };
    } catch (error) {
      console.error('Error sending verification email:', error);
      return { success: false, message: 'Failed to send verification email' };
    }
  }

  /**
   * Verify the 6-digit code and update user verification status
   */
  static async verifyCode(userId: string, inputCode: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check if user exists and is already verified
      const user = await User.findByPk(userId);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      if (user.isVerified) {
        // Clean up any remaining verification entries for this user
        await EmailVerification.destroy({
          where: { userId }
        });
        return { success: false, message: 'Email is already verified' };
      }

      // Get stored verification code from database
      const storedVerification = await EmailVerification.findOne({
        where: {
          userId,
          verified: false
        },
        order: [['createdAt', 'DESC']]
      });
      
      if (!storedVerification) {
        return { success: false, message: 'No verification code found. Please request a new code.' };
      }

      // Check if code has expired
      if (new Date() > storedVerification.expiresAt) {
        await storedVerification.destroy();
        return { success: false, message: 'Verification code has expired. Please request a new code.' };
      }

      // Check attempts limit
      if (storedVerification.attempts >= this.MAX_ATTEMPTS) {
        await storedVerification.destroy();
        return { success: false, message: 'Too many failed attempts. Please request a new code.' };
      }

      // Increment attempts
      await storedVerification.update({ attempts: storedVerification.attempts + 1 });

      // Verify code
      if (storedVerification.verificationCode !== inputCode) {
        const remainingAttempts = this.MAX_ATTEMPTS - storedVerification.attempts;
        if (remainingAttempts > 0) {
          return { 
            success: false, 
            message: `Invalid verification code. ${remainingAttempts} attempts remaining.` 
          };
        } else {
          await storedVerification.destroy();
          return { success: false, message: 'Invalid verification code. Maximum attempts exceeded.' };
        }
      }

      // Code is valid - update user verification status
      // Note: We already checked if user exists at the beginning of the method
      
      // Update user verification status
      await user.update({ isVerified: true });

      // Clean up all verification entries for this user since verification is complete
      await EmailVerification.destroy({
        where: { userId }
      });

      return { success: true, message: 'Email verified successfully!' };
    } catch (error) {
      console.error('Error verifying code:', error);
      return { success: false, message: 'Failed to verify code' };
    }
  }



  /**
   * Clean up expired codes (should be called periodically)
   */
  static async cleanupExpiredCodes(): Promise<void> {
    try {
      const now = new Date();
      await EmailVerification.destroy({
        where: {
          expiresAt: {
            [Op.lt]: now
          }
        }
      });
    } catch (error) {
      console.error('Error cleaning up expired codes:', error);
    }
  }

  /**
   * Get verification status for a user
   */
  static async getVerificationStatus(userId: string): Promise<{ hasCode: boolean; expiresAt?: Date; attempts?: number }> {
    try {
      const verification = await EmailVerification.findOne({
        where: {
          userId,
          verified: false
        },
        order: [['createdAt', 'DESC']]
      });

      if (!verification) {
        return { hasCode: false };
      }

      return {
        hasCode: true,
        expiresAt: verification.expiresAt,
        attempts: verification.attempts
      };
    } catch (error) {
      console.error('Error getting verification status:', error);
      return { hasCode: false };
    }
  }
}

export default EmailVerificationService;