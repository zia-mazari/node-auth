import { Request, Response } from 'express';
import { IUserInput, IUserLogin } from '../types/user.types';
import { LoginService, RegisterService } from '../services/auth';
import PasswordResetService from '../services/auth/passwordReset.service';

/**
 * Register a new user
 * 
 * @param req - Express request object containing user registration data
 * @param res - Express response object
 * @returns Promise<void>
 * 
 * @description
 * Creates a new user account with the provided credentials.
 * Delegates business logic to AuthService.
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  const userData: IUserInput = req.body;
  return RegisterService.register(userData, res);
};

/**
 * Authenticate a user and issue a JWT token
 * 
 * @param req - Express request object containing login credentials
 * @param res - Express response object
 * @returns Promise<void>
 * 
 * @description
 * Authenticates a user with email and password.
 * Delegates business logic to AuthService.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const loginData: IUserLogin = req.body;
  return LoginService.login(loginData, req, res);
};

/**
 * Request password reset via email
 * 
 * @param req - Express request object containing email
 * @param res - Express response object
 * @returns Promise<void>
 * 
 * @description
 * Initiates password reset process by sending reset token via email.
 * Delegates business logic to PasswordResetService.
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  return PasswordResetService.requestPasswordReset(email, req, res);
};

/**
 * Reset password using valid token
 * 
 * @param req - Express request object containing token and new password
 * @param res - Express response object
 * @returns Promise<void>
 * 
 * @description
 * Resets user password using a valid reset token.
 * Delegates business logic to PasswordResetService.
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { verificationCode, newPassword } = req.body;
  return PasswordResetService.resetPassword(verificationCode, newPassword, req, res);
};

/**
 * Validate password reset token
 * 
 * @param req - Express request object containing token
 * @param res - Express response object
 * @returns Promise<void>
 * 
 * @description
 * Validates if a password reset token is valid and not expired.
 * Delegates business logic to PasswordResetService.
 */
export const validateResetToken = async (req: Request, res: Response): Promise<void> => {
  const { verificationCode } = req.params;
  return PasswordResetService.validateResetToken(verificationCode, req, res);
};