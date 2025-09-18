import express from 'express';
import * as userController from '../controllers/user.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { updateProfileSchema, updatePasswordSchema } from '../utils/validations/user.validation';

const router = express.Router();

// Protected routes
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, validateRequest(updateProfileSchema), userController.updateProfile);
router.put('/password', authenticateToken, validateRequest(updatePasswordSchema), userController.updatePassword);

export default router;