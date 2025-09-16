import express from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/user', authenticateToken, userRoutes);

export default router;
