import { Response } from 'express';
import { RequestWithUser } from '../types/express.types';
import { UserService } from '../services/user.service';
import { ApiHelper } from '../utils/helpers/api.helper';

/**
 * Get the authenticated user's profile
 * 
 * @param req - Express request object with authenticated user
 * @param res - Express response object
 * @returns Promise<void>
 * 
 * @description
 * Retrieves the complete profile of the authenticated user.
 * Delegates business logic to UserService.
 */
export const getProfile = async (req: RequestWithUser, res: Response): Promise<void> => {
  if (!req.user) {
    return ApiHelper.unauthorized(res);
  }
  
  return UserService.getProfile(req.user.id, res);
};

/**
 * Update the authenticated user's profile
 * 
 * @param req - Express request object with authenticated user and update data
 * @param res - Express response object
 * @returns Promise<void>
 * 
 * @description
 * Updates the user's basic information.
 * Delegates business logic to UserService.
 */
export const updateProfile = async (req: RequestWithUser, res: Response): Promise<void> => {
  // Ensure req.body exists
  req.body = req.body || {};
  
  if (!req.user) {
    return ApiHelper.unauthorized(res);
  }
  
  // The validation middleware already ensures at least one field is provided
  
  const { firstName, lastName, gender, dateOfBirth, phoneNumber, profilePicture } = req.body;
  
  return UserService.updateProfile(req.user.id, { firstName, lastName, gender, dateOfBirth, phoneNumber, profilePicture }, res);
};

/**
 * Update the authenticated user's password
 * 
 * @param req - Express request object with authenticated user and password data
 * @param res - Express response object
 * @returns Promise<void>
 * 
 * @description
 * Updates the user's password after verifying current password.
 * Delegates business logic to UserService.
 */
export const updatePassword = async (req: RequestWithUser, res: Response): Promise<void> => {
  if (!req.user) {
    return ApiHelper.unauthorized(res);
  }
  
  const passwordData = req.body;
  
  return UserService.updatePassword(req.user.id, passwordData, res);
};