import jwt from 'jsonwebtoken';
import { Response } from 'express';
import User from '../../models/User.model';
import { IUserInput } from '../../types/user.types';
import { ApiHelper, HttpStatus } from '../../utils/helpers/api.helper';
import rateLimitConfig from '../../config/rate-limit.config';
import EmailVerificationService from './emailVerification.service';

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
        return ApiHelper.error(res, 'Email address is already registered. Please use a different email or try logging in.', HttpStatus.CONFLICT);
      }
      
      // Check if username already exists
      const existingUsername = await User.findOne({ where: { username: userData.username } });
      if (existingUsername) {
        return ApiHelper.error(res, 'Username is already taken. Please choose a different username.', HttpStatus.CONFLICT);
      }

      // Create user (isVerified defaults to false)
      const user = await User.create(userData);
      
      // Send verification email
      try {
        await EmailVerificationService.sendVerificationEmail(user.id);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Continue with registration even if email fails
      }
      
      // Generate token
      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username,
          email: user.email,
          isVerified: user.isVerified
        },
        process.env.JWT_SECRET!,
        { expiresIn: rateLimitConfig.jwt.tokenExpiration }
      );

      return ApiHelper.created(res, 'REGISTRATION_SUCCESSFUL', { 
        token,
        message: 'Registration successful. Please check your email for verification code.'
      });
    } catch (error) {
      console.error('AUTH SERVICE - Registration error:', error);
      return ApiHelper.error(res, 'REGISTRATION_FAILED', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}