import bcrypt from 'bcryptjs';
import { Response } from 'express';
import User from '../../models/User.model';
import { IPasswordUpdate } from '../../types/user.types';
import { ApiHelper, HttpStatus } from '../../utils/helpers/api.helper';
import { hashPassword } from '../../utils/helpers/password.helper';

export class PasswordService {
  /**
   * Update a user's password
   * 
   * @param userId - The unique identifier of the user
   * @param passwordData - Object containing current and new password
   * @param res - Express response object
   * @returns Promise<void>
   */
  static async updatePassword(userId: string, passwordData: IPasswordUpdate, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword, logout = false } = passwordData;
      
      const user = await User.findByPk(userId);
      if (!user) {
        return ApiHelper.notFound(res);
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return ApiHelper.unauthorized(res);
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);

      // Update password
      await user.update({ password: hashedPassword });

      // Handle logout if requested
      if (logout) {
        // Clear the authentication cookie
        res.clearCookie('jwt');
        return ApiHelper.success(res, 'PASSWORD_UPDATED_AND_LOGGED_OUT');
      }

      return ApiHelper.success(res, 'PASSWORD_UPDATED');
    } catch (error) {
      console.error('USER SERVICE - Update password error:', error);
      return ApiHelper.error(res, 'PASSWORD_UPDATE_FAILED', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}