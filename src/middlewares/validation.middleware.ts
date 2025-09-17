import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { body, validationResult } from 'express-validator';

// Enhanced Joi validation with sanitization
export const validateRequest = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true // Remove unknown fields
    });
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.context?.key,
          message: detail.message
        }))
      });
    }

    next();
  };
};

// Express-validator middleware for input validation and sanitization
export const validate = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array().map(err => ({
        field: (err as any).path || (err as any).param || 'unknown',
        message: (err as any).msg || 'Invalid value'
      }))
    });
  };
};

// Common validation rules
export const authValidationRules = {
  login: [
    body('email').isEmail().normalizeEmail().withMessage('Must be a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  register: [
    body('username').notEmpty().trim().escape().withMessage('Username is required'),
    body('email').isEmail().normalizeEmail().withMessage('Must be a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
      .matches(/[0-9]/).withMessage('Password must contain at least one number')
      .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least one special character')
  ]
};