import { Request, Response } from 'express';
import { IUserInput, IUserLogin } from '../types/user.types';
import { LoginService, RegisterService } from '../services/auth';

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
  return LoginService.login(loginData, res);
};