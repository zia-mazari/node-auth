import express from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { loginSchema, signupSchema } from '../utils/validations/auth.validation';

const router = express.Router();

// Public routes
router.post('/register', validateRequest(signupSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);

export default router;