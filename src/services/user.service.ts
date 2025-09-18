import bcrypt from 'bcryptjs';
import { Response } from 'express';
import User from '../models/User.model';
import UserDetail from '../models/UserDetail.model';
import { IPasswordUpdate } from '../types/user.types';
import { ApiHelper, HttpStatus } from '../utils/helpers/api.helper';

export class UserService {
  /**
   * Retrieve a user's profile by ID
   * 
   * @param userId - The unique identifier of the user
   * @param res - Express response object
   * @returns Promise<void>
   */
  static async getProfile(userId: string, res: Response): Promise<void> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return ApiHelper.notFound(res);
      }
      
      // Return user data without sensitive information
      const userData = {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
      
      return ApiHelper.success(res, 'PROFILE_RETRIEVED', userData);
    } catch (error) {
      console.error('USER SERVICE - Get profile error:', error);
      return ApiHelper.error(res, 'PROFILE_RETRIEVAL_FAILED', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Update a user's profile information
   * 
   * @param userId - The unique identifier of the user
   * @param profileData - Object containing profile fields to update
   * @param res - Express response object
   * @returns Promise<void>
   */
  static async updateProfile(userId: string, profileData: { firstName?: string, lastName?: string, gender?: string, dateOfBirth?: string, phoneNumber?: string, profilePicture?: string }, res: Response): Promise<void> {
    try {
      const user = await User.findByPk(userId, {
        include: [{ model: UserDetail, as: 'userDetail' }]
      });
      
      if (!user) {
        return ApiHelper.notFound(res);
      }

      // Get or create user detail
      let userDetail = user.userDetail;
      if (!userDetail) {
        userDetail = await UserDetail.create({ userId: user.id });
      }

      // Update user detail with provided fields
      const updateData: any = {};
      if (profileData.firstName !== undefined) updateData.firstName = profileData.firstName;
      if (profileData.lastName !== undefined) updateData.lastName = profileData.lastName;
      if (profileData.gender !== undefined) updateData.gender = profileData.gender;
      if (profileData.dateOfBirth !== undefined) updateData.dateOfBirth = profileData.dateOfBirth;
      if (profileData.phoneNumber !== undefined) updateData.phoneNumber = profileData.phoneNumber;
      if (profileData.profilePicture !== undefined) updateData.profilePicture = profileData.profilePicture;

      await userDetail.update(updateData);

      // Return updated user data
      const userData = {
        id: user.id,
        username: user.username,
        email: user.email,
        profile: {
          firstName: userDetail.firstName,
          lastName: userDetail.lastName,
          gender: userDetail.gender,
          dateOfBirth: userDetail.dateOfBirth,
          phoneNumber: userDetail.phoneNumber,
          profilePicture: userDetail.profilePicture
        },
        updatedAt: user.updatedAt
      };

      return ApiHelper.success(res, 'PROFILE_UPDATED', userData);
    } catch (error) {
      console.error('USER SERVICE - Update profile error:', error);
      return ApiHelper.error(res, 'PROFILE_UPDATE_FAILED', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

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
      const { currentPassword, newPassword } = passwordData;
      
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
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await user.update({ password: hashedPassword });

      return ApiHelper.success(res, 'PASSWORD_UPDATED');
    } catch (error) {
      console.error('USER SERVICE - Update password error:', error);
      return ApiHelper.error(res, 'PASSWORD_UPDATE_FAILED', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
