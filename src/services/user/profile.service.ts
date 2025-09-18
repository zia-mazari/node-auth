import { Response } from 'express';
import User from '../../models/User.model';
import UserDetail from '../../models/UserDetail.model';
import { ApiHelper, HttpStatus } from '../../utils/helpers/api.helper';

export class ProfileService {
  /**
   * Retrieve a user's profile by ID
   * 
   * @param userId - The unique identifier of the user
   * @param res - Express response object
   * @returns Promise<void>
   */
  static async getProfile(userId: string, res: Response): Promise<void> {
    try {
      const user = await User.findByPk(userId, {
        include: [{ model: UserDetail, as: 'userDetail' }]
      });
      
      if (!user) {
        return ApiHelper.notFound(res);
      }
      
      // Get user detail or create empty object if not exists
      const userDetail = (user.userDetail as any) || {};
      
      // Return full user data including profile details
      const userData = {
        id: user.id,
        username: user.username,
        email: user.email,
        profile: {
          firstName: userDetail.firstName || null,
          lastName: userDetail.lastName || null,
          gender: userDetail.gender || null,
          dateOfBirth: userDetail.dateOfBirth || null,
          phoneNumber: userDetail.phoneNumber || null,
          profilePicture: userDetail.profilePicture || null
        },
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

      // Don't return user data after profile update
      return ApiHelper.success(res, 'PROFILE_UPDATED');
    } catch (error) {
      console.error('USER SERVICE - Update profile error:', error);
      return ApiHelper.error(res, 'PROFILE_UPDATE_FAILED', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}