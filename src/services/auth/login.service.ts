import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Response } from 'express';
import User from '../../models/User.model';
import { IUserLogin } from '../../types/user.types';
import { ApiHelper, HttpStatus } from '../../utils/helpers/api.helper';

export class LoginService {
  /**
   * Authenticate a user and send API response
   * 
   * @param loginData - User's login credentials
   * @param res - Express response object
   * @returns Promise<void>
   * 
   * @description
   * Validates user credentials and generates authentication token.
   * Sends appropriate API response.
   */
  static async login(loginData: IUserLogin, res: Response): Promise<void> {
    try {
      const { email, password } = loginData;
      
      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return ApiHelper.unauthorized(res);
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return ApiHelper.unauthorized(res);
      }

      // User authenticated successfully
      const tokenPayload = { 
        userId: user.id, 
        username: user.username,
        email: user.email
      };
      
      // Generate token
      const token = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      );

      return ApiHelper.success(res, 'LOGIN_SUCCESSFUL', { token });
    } catch (error) {
      console.error('AUTH SERVICE - Login error:', error);
      return ApiHelper.error(res, 'LOGIN_FAILED', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}