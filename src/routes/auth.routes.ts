import express from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { 
  loginSchema, 
  signupSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema, 
  validateTokenSchema 
} from '../utils/validations/auth.validation';

const router = express.Router();

// Public routes
router.post('/register', validateRequest(signupSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);

// Password reset routes
router.post('/forgot-password', validateRequest(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordSchema), authController.resetPassword);
router.get('/validate-code/:verificationCode', authController.validateResetToken);

export default router;