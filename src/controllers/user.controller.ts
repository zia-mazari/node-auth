import { Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.model';
import UserDetail from '../models/UserDetail.model';
import { RequestWithUser } from '../types/express.types';
import { IPasswordUpdate } from '../types/user.types';

// Simple response interface to replace removed API types
interface ResponseData {
  success: boolean;
  message: string;
  data: any | null;
}

/**
 * Get the authenticated user's profile
 * 
 * @param req - Express request object with authenticated user
 * @param res - Express response object
 * @returns Promise<void>
 * 
 * @description
 * Retrieves the complete profile of the authenticated user.
 * Includes user details if available.
 */
export const getProfile = async (req: RequestWithUser, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      const response: ResponseData = {
        success: false,
        message: 'User not authenticated',
        data: null
      };
      res.status(401).json(response);
      return;
    }

    const user = await User.findByPk(req.user.id, {
      include: [{ model: UserDetail, as: 'userDetail' }]
    });
    
    if (!user) {
      const response: ResponseData = {
        success: false,
        message: 'User not found',
        data: null
      };
      res.status(404).json(response);
      return;
    }

    const userDetail = user.user_detail || {
      user_id: user.id,
      first_name: null,
      middle_name: null,
      last_name: null,
      gender: null,
      date_of_birth: null,
      phone_number: null,
      profile_picture: null
    };
    
    const response: ResponseData = {
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        is_verified: user.is_verified,
         first_name: userDetail.first_name,
         last_name: userDetail.last_name,
         date_of_birth: userDetail.date_of_birth,
         phone_number: userDetail.phone_number,
         profile_picture: userDetail.profile_picture
      }
    };
    res.json(response);
  } catch (error) {
    console.error('Get profile error:', error);
    const response: ResponseData = {
      success: false,
      message: 'Server error',
      data: null
    };
    res.status(500).json(response);
  }
}

/**
 * Update the authenticated user's profile
 * 
 * @param req - Express request object with authenticated user and update data
 * @param res - Express response object
 * @returns Promise<void>
 * 
 * @description
 * Updates the user's basic information and profile details.
 * Validates email uniqueness if being changed.
 */
export const updateProfile = async (req: RequestWithUser, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      const response: ResponseData = {
        success: false,
        message: 'User not authenticated',
        data: null
      };
      res.status(401).json(response);
      return;
    }

    const user = await User.findByPk(req.user.id, {
      include: [{ model: UserDetail, as: 'userDetail' }]
    });
    
    if (!user) {
      const response: ResponseData = {
        success: false,
        message: 'User not found',
        data: null
      };
      res.status(404).json(response);
      return;
    }

    const { username, email, firstName, lastName, dateOfBirth, phoneNumber, gender } = req.body;

    // Check if email is already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        const response: ResponseData = {
          success: false,
          message: 'Email is already in use',
          data: null
        };
        res.status(400).json(response);
        return;
      }
    }

    // Update user basic info
    await user.update({
      username: username || user.username,
      email: email || user.email
    });
    
    // Create or update user details
    let userDetail = user.user_detail;
    
    if (!userDetail) {
      // Create new user detail if it doesn't exist
      userDetail = await UserDetail.create({
        user_id: user.id,
        first_name: firstName,
        last_name: lastName,
        gender,
        date_of_birth: dateOfBirth,
        phone_number: phoneNumber
      });
    } else {
      // Update existing user detail
      await userDetail.update({
      first_name: firstName || userDetail.first_name,
      last_name: lastName || userDetail.last_name,
      gender: gender || userDetail.gender,
      date_of_birth: dateOfBirth || userDetail.date_of_birth,
      phone_number: phoneNumber || userDetail.phone_number
      });
    }

    const response: ResponseData = {
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: userDetail.first_name,
      last_name: userDetail.last_name,
      gender: userDetail.gender,
      date_of_birth: userDetail.date_of_birth,
      phone_number: userDetail.phone_number
      }
    };
    res.json(response);
  } catch (error) {
    console.error('Update profile error:', error);
    const response: ResponseData = {
      success: false,
      message: 'Failed to update profile',
      data: null
    };
    res.status(500).json(response);
  }
};

/**
 * Update the authenticated user's password
 * 
 * @param req - Express request object with authenticated user and password data
 * @param res - Express response object
 * @returns Promise<void>
 * 
 * @description
 * Verifies current password and updates to new password if valid.
 * Securely hashes the new password before storing.
 */
export const updatePassword = async (req: RequestWithUser, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      const response: ResponseData = {
        success: false,
        message: 'User not authenticated',
        data: null
      };
      res.status(401).json(response);
      return;
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      const response: ResponseData = {
        success: false,
        message: 'User not found',
        data: null
      };
      res.status(404).json(response);
      return;
    }

    const { currentPassword, newPassword }: IPasswordUpdate = req.body;

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      const response: ResponseData = {
        success: false,
        message: 'Current password is incorrect',
        data: null
      };
      res.status(401).json(response);
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await user.update({ password: hashedPassword });

    const response: ResponseData = {
      success: true,
      message: 'Password updated successfully',
      data: null
    };
    res.json(response);
  } catch (error) {
    console.error('Update password error:', error);
    const response: ResponseData = {
      success: false,
      message: 'Failed to update password',
      data: null
    };
    res.status(500).json(response);
  }
};