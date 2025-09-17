import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.model';
import { IUserInput, IUserLogin } from '../types/user.types';

export interface AuthResponse {
  user: User;
  token: string;
}

export class AuthService {
  /**
   * Register a new user in the system
   * 
   * @param userData - User registration data including username, email, and password
   * @returns Promise<User> - The newly created user object
   * 
   * @description
   * Checks if a user with the provided email already exists.
   * If not, creates a new user record in the database.
   * Password hashing is handled by the User model hooks.
   * @throws Error if user with the email already exists
   */
  static async register(userData: IUserInput): Promise<User> {
    // Check if user exists
    const existingUser = await User.findOne({
      where: {
        email: userData.email
      }
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create user
    const user = await User.create(userData);
    return user;
  }

  /**
   * Authenticate a user and generate JWT token
   * 
   * @param email - User's email address
   * @param password - User's password (plain text)
   * @returns Promise<AuthResponse> - Object containing user data and JWT token
   * 
   * @description
   * Validates user credentials and generates authentication token.
   * Updates the user's last login timestamp on successful authentication.
   * @throws Error if credentials are invalid
   */
  static async login(email: string, password: string): Promise<AuthResponse> {
    // Find user
    const user = await User.findOne({
      where: { email }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // User authenticated successfully

    // Generate token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    return { user, token };
  }
}