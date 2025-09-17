import dotenv from 'dotenv';
import express, { Express, Request, Response, NextFunction } from 'express';
import { testConnection, sequelize } from './config/database.config';
import routes from './routes';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

// Security middleware
// 1. CORS protection
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', // In production, set this to your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. HTTP security headers with Helmet
app.use(helmet());

// 3. Rate limiting to prevent brute force attacks
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', apiLimiter);

// Standard middleware
app.use(express.json({ limit: '10kb' })); // Limit JSON payload size
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  
  // Don't expose stack traces in production
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : err.message || 'Something went wrong';
  
  res.status(500).json({
    success: false,
    message: errorMessage,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Initialize database and start server
const startServer = async (): Promise<void> => {
  try {
    // Test database connection
    await testConnection();
    
    // Sync database (in development only)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('Database synced in development mode');
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();