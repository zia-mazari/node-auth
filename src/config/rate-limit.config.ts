/**
 * Rate limiting configuration
 * Controls parameters for login attempt rate limiting
 * All values are loaded from environment variables with defaults
 */

// Parse progressive block durations from environment variable
const getBlockDurations = (): number[] => {
  const envDurations = process.env.RATE_LIMIT_BLOCK_DURATIONS;
  if (envDurations) {
    try {
      // Format should be comma-separated minutes: "15,30,60"
      return envDurations.split(',')
        .map(minutes => parseInt(minutes.trim(), 10) * 60 * 1000);
    } catch (error) {
      console.warn('Invalid RATE_LIMIT_BLOCK_DURATIONS format, using defaults');
    }
  }
  // Default progressive durations if not specified
  return [
    15 * 60 * 1000,  // 15 minutes
    30 * 60 * 1000,  // 30 minutes
    60 * 60 * 1000   // 1 hour
  ];
};

export const rateLimitConfig = {
  // Login rate limiting configuration
  // Maximum number of failed attempts before blocking
  maxAttempts: parseInt(process.env.RATE_LIMIT_MAX_ATTEMPTS || '5', 10),
  
  // Progressive block durations in milliseconds
  blockDurations: getBlockDurations(),
  
  // Default block duration if no progressive block applies (15 minutes)
  blockDurationMs: parseInt(process.env.RATE_LIMIT_BLOCK_DURATION || '15', 10) * 60 * 1000,
  
  // Time window for counting attempts in milliseconds (1 hour)
  windowDurationMs: parseInt(process.env.RATE_LIMIT_WINDOW_DURATION || '60', 10) * 60 * 1000,
  
  // Reset period in milliseconds (30 seconds by default)
  // If a user attempts to login after this period, the attempt count resets to 1
  attemptResetMs: parseInt(process.env.RATE_LIMIT_ATTEMPT_RESET || '30', 10) * 1000,
  
  // Maximum block count before stopping attempt count increments (default: 2)
  // After this many blocks, attempt count stops incrementing to prevent infinite escalation
  maxBlockCount: parseInt(process.env.RATE_LIMIT_MAX_BLOCK_COUNT || '2', 10),
  
  // Enable cleanup of old records (recommended for production)
  enableCleanup: process.env.RATE_LIMIT_ENABLE_CLEANUP !== 'false',
  
  // Cleanup interval in milliseconds (1 hour)
  cleanupIntervalMs: parseInt(process.env.RATE_LIMIT_CLEANUP_INTERVAL || '60', 10) * 60 * 1000,

  // Password reset rate limiting configuration
  passwordReset: {
    // Maximum number of password reset requests before blocking (default: 3)
    maxAttempts: parseInt(process.env.PWD_RESET_MAX_ATTEMPTS || '3', 10),
    
    // Block duration for password reset requests in minutes (default: 15 minutes)
    blockDurationMs: parseInt(process.env.PWD_RESET_BLOCK_DURATION || '15', 10) * 60 * 1000,
    
    // Maximum number of wrong verification code attempts before blocking (default: 5)
    maxFailureAttempts: parseInt(process.env.PWD_RESET_MAX_FAILURE_ATTEMPTS || '5', 10),
    
    // Block duration for wrong verification codes in minutes (default: 30 minutes)
    failureBlockDurationMs: parseInt(process.env.PWD_RESET_FAILURE_BLOCK_DURATION || '30', 10) * 60 * 1000,
    
    // Maximum number of active password reset tokens per user (default: 2)
    maxActiveTokens: parseInt(process.env.PWD_RESET_MAX_ACTIVE_TOKENS || '2', 10),
    
    // Token expiration time in minutes (default: 15 minutes)
    tokenExpirationMinutes: parseInt(process.env.PWD_RESET_TOKEN_EXPIRATION || '15', 10)
  },

  // JWT configuration
  jwt: {
    // JWT token expiration time (default: '1h')
    // Can be a string like '1h', '24h', '7d' or number of seconds
    tokenExpiration: process.env.JWT_TOKEN_EXPIRATION || '1h'
  }
};

export default rateLimitConfig;