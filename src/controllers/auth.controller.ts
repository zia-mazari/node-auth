import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.model';
import { IUserInput, IUserLogin } from '../types/user.types';

// Simple response interface to replace removed API types
interface ResponseData {
  success: boolean;
  message: string;
  data: any | null;
}

/**
 * Register a new user
 * 
 * @param req - Express request object containing user registration data
 * @param res - Express response object
 * @returns Promise<void>
 * 
 * @description
 * Creates a new user account with the provided credentials.
 * Validates that the email is not already in use.
 * Returns a JWT token upon successful registration.
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const userData: IUserInput = req.body;

    const existingUser = await User.findOne({ where: { email: userData.email } });
    if (existingUser) {
      const response: ResponseData = {
        success: false,
        message: 'User already exists',
        data: null
      };
      res.status(409).json(response);
      return;
    }

    const user = await User.create(userData);
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        email: user.email
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    const response: ResponseData = {
      success: true,
      message: 'Registration successful',
      data: { token }
    };
    res.status(201).json(response);
  } catch (error) {
    console.error('Registration error:', error);
    const response: ResponseData = {
      success: false,
      message: 'Registration failed',
      data: null
    };
    res.status(500).json(response);
  }
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
 * Updates the last login timestamp on successful login.
 * Returns a JWT token for authenticated requests.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: IUserLogin = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      const response: ResponseData = {
        success: false,
        message: 'Invalid credentials',
        data: null
      };
      res.status(401).json(response);
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      const response: ResponseData = {
        success: false,
        message: 'Invalid credentials',
        data: null
      };
      res.status(401).json(response);
      return;
    }

    // Update last login time
    await user.update({ lastLogin: new Date() });

    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        email: user.email
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    const response: ResponseData = {
      success: true,
      message: 'Login successful',
      data: { token }
    };
    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    const response: ResponseData = {
      success: false,
      message: 'Login failed',
      data: null
    };
    res.status(500).json(response);
  }
};