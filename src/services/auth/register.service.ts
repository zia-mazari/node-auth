import jwt from 'jsonwebtoken';
import { Response } from 'express';
import User from '../../models/User.model';
import { IUserInput } from '../../types/user.types';
import { ApiHelper, HttpStatus } from '../../utils/helpers/api.helper';

export class RegisterService {
  /**
   * Register a new user in the system and send API response
   * 
   * @param userData - User registration data including username, email, and password
   * @param res - Express response object
   * @returns Promise<void>
   * 
   * @description
   * Checks if a user with the provided email or username already exists.
   * If not, creates a new user record in the database.
   * Sends appropriate API response.
   */
  static async register(userData: IUserInput, res: Response): Promise<void> {
    try {
      // Check if email already exists
      const existingEmail = await User.findOne({ where: { email: userData.email } });
      if (existingEmail) {
        return ApiHelper.conflict(res);
      }
      
      // Check if username already exists
      const existingUsername = await User.findOne({ where: { username: userData.username } });
      if (existingUsername) {
        return ApiHelper.conflict(res);
      }

      // Create user
      const user = await User.create(userData);
      
      // Generate token
      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username,
          email: user.email
        },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      );

      return ApiHelper.created(res, 'REGISTRATION_SUCCESSFUL', { token });
    } catch (error) {
      console.error('AUTH SERVICE - Registration error:', error);
      return ApiHelper.error(res, 'REGISTRATION_FAILED', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}