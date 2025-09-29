import { ApiRateLimit } from '../../models/ApiRateLimit.model';
import rateLimitConfig from '../../config/rate-limit.config';

export class RateLimitService {
  /**
   * Check if user is currently blocked (read-only, no mutations)
   */
  static async isBlocked(
    ip: string,
    username: string
  ): Promise<{ blocked: boolean; message?: string; blockedUntil?: Date; durationMs?: number }> {
    try {
      const record = await ApiRateLimit.findOne({ where: { ip, username } });
      if (!record || !record.blockedUntil) {
        return { blocked: false };
      }

      const now = Date.now();
      const blockedUntil = new Date(record.blockedUntil);
      
      if (blockedUntil.getTime() > now) {
        // Still blocked
        const currentBlockCount = record.blockCount ?? 0;
        const durations = rateLimitConfig.blockDurations;
        const idx = Math.min(Math.max(currentBlockCount - 1, 0), durations.length - 1);
        const durationMs = durations[idx] ?? rateLimitConfig.blockDurationMs;
        const minutes = Math.round(durationMs / 60000);
        const message = `Too many failed login attempts. Your access is temporarily blocked for ${minutes} minutes (until ${blockedUntil.toISOString()}).`;
        
        return { blocked: true, message, blockedUntil, durationMs };
      } else {
        // Block expired - reset attemptCount but keep blockCount for progressive penalties
        await record.update({ 
          attemptCount: 0, 
          blockedUntil: null 
        });
        return { blocked: false };
      }
    } catch (error) {
      console.error('RATE LIMIT SERVICE - isBlocked error:', error);
      return { blocked: false };
    }
  }

  /**
   * Record a failed login attempt and apply blocking logic if threshold reached
   */
  static async recordFailedAttempt(
    ip: string,
    username: string
  ): Promise<{ blocked: boolean; message?: string; blockedUntil?: Date; durationMs?: number }> {
    try {
      // Find existing record or create new one
      const [record, created] = await ApiRateLimit.findOrCreate({
        where: { ip, username },
        defaults: { 
          ip,
          username,
          attemptCount: 1, 
          blockCount: 0,
          blockedUntil: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // If record already existed, increment attempt count
      if (!created) {
        await record.increment('attemptCount', { by: 1 });
        await record.reload();
      }

      const maxAttempts = rateLimitConfig.maxAttempts;
      
      // Always calculate and update blockCount based on multiples of 5 attempts
      // blockCount should never decrease (progressive penalties)
      if (maxAttempts > 0) {
        const newBlockCount = Math.floor(record.attemptCount / maxAttempts);
        
        // Only update blockCount if it increases (never decrease)
        if (newBlockCount > record.blockCount) {
          await record.update({ blockCount: newBlockCount });
          await record.reload();
        }
      }
      
      // Check if we should trigger/update a block
      if (maxAttempts > 0 && record.attemptCount >= maxAttempts) {
        const currentBlockCount = record.blockCount;
        const durations = rateLimitConfig.blockDurations;
        const idx = Math.min(Math.max(currentBlockCount - 1, 0), durations.length - 1);
        const durationMs = durations[idx] ?? rateLimitConfig.blockDurationMs;
        const blockedUntil = new Date(Date.now() + durationMs);

        await record.update({ blockedUntil });

        const minutes = Math.round(durationMs / 60000);
        const message = `Too many failed login attempts. Your access is temporarily blocked for ${minutes} minutes (until ${blockedUntil.toISOString()}).`;
        
        return { blocked: true, message, blockedUntil, durationMs };
      }

      return { blocked: false };
    } catch (error) {
      console.error('RATE LIMIT SERVICE - Record failed attempt error:', error);
      return { blocked: false };
    }
  }

  /**
   * Track a blocked attempt (when user tries to login while already blocked)
   */
  static async recordBlockedAttempt(
    ip: string,
    username: string
  ): Promise<void> {
    try {
      const record = await ApiRateLimit.findOne({ where: { ip, username } });
      if (record) {
        // Only increment attemptCount if blockCount < 2
        // After blockCount >= 2, attemptCount should stop incrementing
        if (record.blockCount < 2) {
          await record.increment('attemptCount', { by: 1 });
          await record.reload();
          
          // Recalculate blockCount after incrementing attemptCount
          // blockCount should never decrease (progressive penalties)
          const maxAttempts = rateLimitConfig.maxAttempts;
          if (maxAttempts > 0) {
            const newBlockCount = Math.floor(record.attemptCount / maxAttempts);
            if (newBlockCount > record.blockCount) {
              await record.update({ blockCount: newBlockCount });
              await record.reload();
            }
          }
        }
      }
    } catch (error) {
      console.error('RATE LIMIT SERVICE - Record blocked attempt error:', error);
    }
  }

  /**
   * Reset only attemptCount while keeping block active (for correct password during block period)
   */
  static async resetAttemptCount(ip: string, username: string): Promise<void> {
    try {
      const record = await ApiRateLimit.findOne({ where: { ip, username } });
      if (record) {
        await record.update({ attemptCount: 0 });
      }
    } catch (error) {
      console.error('RATE LIMIT SERVICE - Reset attempt count error:', error);
    }
  }

  /**
   * Clear all rate limit data for a user (typically after successful login when not blocked)
   */
  static async clear(ip: string, username: string): Promise<void> {
    try {
      await ApiRateLimit.destroy({ where: { ip, username } });
    } catch (error) {
      console.error('RATE LIMIT SERVICE - Clear entry error:', error);
    }
  }

  /**
   * Get current attempt statistics (for debugging/monitoring)
   */
  static async getStats(
    ip: string,
    username: string
  ): Promise<{ attemptCount: number; blockCount: number; blockedUntil: Date | null } | null> {
    try {
      const record = await ApiRateLimit.findOne({ where: { ip, username } });
      if (!record) return null;
      
      return {
        attemptCount: record.attemptCount,
        blockCount: record.blockCount ?? 0,
        blockedUntil: record.blockedUntil
      };
    } catch (error) {
      console.error('RATE LIMIT SERVICE - Get stats error:', error);
      return null;
    }
  }

  /**
   * Check password reset rate limiting (separate from login rate limiting)
   * Allows 3 password reset requests per hour per IP/email combination
   */
  static async checkPasswordResetRateLimit(
    ip: string,
    email: string
  ): Promise<{ blocked: boolean; message?: string; blockedUntil?: Date; durationMs?: number }> {
    try {
      const identifier = `pwd_reset_${ip}_${email}`;
      const record = await ApiRateLimit.findOne({ where: { ip: identifier, username: email } });
      
      if (!record) {
        return { blocked: false };
      }

      // Check if currently blocked
      if (record.blockedUntil && new Date(record.blockedUntil).getTime() > Date.now()) {
        const blockedUntil = new Date(record.blockedUntil);
        const durationMs = blockedUntil.getTime() - Date.now();
        const minutes = Math.ceil(durationMs / 60000);
        const message = `Too many password reset requests. Please wait ${minutes} minutes before trying again.`;
        
        return { blocked: true, message, blockedUntil, durationMs };
      }

      // Check if block has expired - reset if so
      if (record.blockedUntil && new Date(record.blockedUntil).getTime() <= Date.now()) {
        await record.update({ 
          attemptCount: 0, 
          blockedUntil: null,
          blockCount: 0
        });
        return { blocked: false };
      }

      return { blocked: false };
    } catch (error) {
      console.error('RATE LIMIT SERVICE - Check password reset rate limit error:', error);
      return { blocked: false };
    }
  }

  /**
   * Record a password reset attempt
   * Blocks after 3 attempts for 1 hour
   */
  static async recordPasswordResetAttempt(
    ip: string,
    email: string
  ): Promise<{ blocked: boolean; message?: string; blockedUntil?: Date; durationMs?: number }> {
    try {
      const identifier = `pwd_reset_${ip}_${email}`;
      const maxAttempts = 3; // Allow 3 password reset requests per 15 minutes
      const blockDurationMs = 15 * 60 * 1000; // 15 minutes block

      // Find existing record or create new one
      const [record, created] = await ApiRateLimit.findOrCreate({
        where: { ip: identifier, username: email },
        defaults: { 
          ip: identifier,
          username: email,
          attemptCount: 1, 
          blockCount: 0,
          blockedUntil: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // If record already existed, increment attempt count
      if (!created) {
        await record.increment('attemptCount', { by: 1 });
        await record.reload();
      }

      // Check if we should trigger a block
      if (record.attemptCount >= maxAttempts) {
        const blockedUntil = new Date(Date.now() + blockDurationMs);
        await record.update({ blockedUntil, blockCount: 1 });

        const minutes = Math.round(blockDurationMs / 60000);
        const message = `Too many password reset requests. Please wait ${minutes} minutes before trying again.`;
        
        return { blocked: true, message, blockedUntil, durationMs: blockDurationMs };
      }

      return { blocked: false };
    } catch (error) {
      console.error('RATE LIMIT SERVICE - Record password reset attempt error:', error);
      return { blocked: false };
    }
  }

  /**
   * Check if user+IP is blocked for wrong password reset attempts
   */
  static async checkPasswordResetFailureBlock(
    ip: string,
    email: string
  ): Promise<{ blocked: boolean; message?: string; blockedUntil?: Date; durationMs?: number }> {
    try {
      const identifier = `pwd_reset_fail_${ip}_${email}`;
      const record = await ApiRateLimit.findOne({ where: { ip: identifier, username: email } });
      
      if (!record) {
        return { blocked: false };
      }

      // Check if currently blocked
      if (record.blockedUntil && new Date(record.blockedUntil).getTime() > Date.now()) {
        const blockedUntil = new Date(record.blockedUntil);
        const durationMs = blockedUntil.getTime() - Date.now();
        const minutes = Math.ceil(durationMs / 60000);
        const message = `Too many failed password reset attempts. Please wait ${minutes} minutes before trying again.`;
        
        return { blocked: true, message, blockedUntil, durationMs };
      }

      // Check if block has expired - reset if so
      if (record.blockedUntil && new Date(record.blockedUntil).getTime() <= Date.now()) {
        await record.update({ 
          attemptCount: 0, 
          blockedUntil: null,
          blockCount: 0
        });
        return { blocked: false };
      }

      return { blocked: false };
    } catch (error) {
      console.error('RATE LIMIT SERVICE - Check password reset failure block error:', error);
      return { blocked: false };
    }
  }

  /**
   * Record a failed password reset attempt (wrong token)
   * Blocks after 5 wrong attempts for 30 minutes
   */
  static async recordPasswordResetFailure(
    ip: string,
    email: string
  ): Promise<{ blocked: boolean; message?: string; blockedUntil?: Date; durationMs?: number }> {
    try {
      const identifier = `pwd_reset_fail_${ip}_${email}`;
      const maxAttempts = 5; // Allow 5 wrong attempts before blocking
      const blockDurationMs = 30 * 60 * 1000; // 30 minutes block

      // Find existing record or create new one
      const [record, created] = await ApiRateLimit.findOrCreate({
        where: { ip: identifier, username: email },
        defaults: { 
          ip: identifier,
          username: email,
          attemptCount: 1, 
          blockCount: 0,
          blockedUntil: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // If record already existed, increment attempt count
      if (!created) {
        await record.increment('attemptCount', { by: 1 });
        await record.reload();
      }

      // Check if we should trigger a block
      if (record.attemptCount >= maxAttempts) {
        const blockedUntil = new Date(Date.now() + blockDurationMs);
        await record.update({ blockedUntil, blockCount: 1 });

        const minutes = Math.round(blockDurationMs / 60000);
        const message = `Too many failed password reset attempts. Please wait ${minutes} minutes before trying again.`;
        
        return { blocked: true, message, blockedUntil, durationMs: blockDurationMs };
      }

      return { blocked: false };
    } catch (error) {
      console.error('RATE LIMIT SERVICE - Record password reset failure error:', error);
      return { blocked: false };
    }
  }

  /**
   * Clear password reset failure records (after successful reset)
   */
  static async clearPasswordResetFailures(ip: string, email: string): Promise<void> {
    try {
      const identifier = `pwd_reset_fail_${ip}_${email}`;
      await ApiRateLimit.destroy({ where: { ip: identifier, username: email } });
    } catch (error) {
      console.error('RATE LIMIT SERVICE - Clear password reset failures error:', error);
    }
  }

  /**
   * Clear password reset request records (after successful reset)
   */
  static async clearPasswordResetRequests(ip: string, email: string): Promise<void> {
    try {
      const identifier = `pwd_reset_${ip}_${email}`;
      await ApiRateLimit.destroy({ where: { ip: identifier, username: email } });
    } catch (error) {
      console.error('RATE LIMIT SERVICE - Clear password reset requests error:', error);
    }
  }
}

export default RateLimitService;