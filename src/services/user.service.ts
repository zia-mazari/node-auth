import bcrypt from 'bcryptjs';
import User from '../models/User.model';
import { IPasswordUpdate } from '../types/user.types';

export class UserService {
  /**
   * Retrieve a user's profile by ID
   * 
   * @param userId - The unique identifier of the user
   * @returns Promise<User> - The user object with profile information
   * @throws Error if user is not found
   */
  static async getProfile(userId: string): Promise<User> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  /**
   * Update a user's profile information
   * 
   * @param userId - The unique identifier of the user
   * @param username - Optional new username
   * @param email - Optional new email address
   * @returns Promise<User> - The updated user object
   * @throws Error if user is not found or email is already in use
   */
  static async updateProfile(userId: string, username?: string, email?: string): Promise<User> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if email is already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error('Email already in use');
      }
    }

    // Update user
    await user.update({
      username: username || user.username,
      email: email || user.email
    });

    return user;
  }

  /**
   * Update a user's password
   * 
   * @param userId - The unique identifier of the user
   * @param currentPassword - User's current password for verification
   * @param newPassword - New password to set
   * @throws Error if user is not found or current password is incorrect
   */
  static async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await user.update({ password: hashedPassword });
  }
}
