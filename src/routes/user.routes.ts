import express from 'express';
import * as userController from '../controllers/user.controller';

const router = express.Router();

// Protected routes
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/password', userController.updatePassword);

export default router;