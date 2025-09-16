import Joi from 'joi';

export interface LoginSchema {
  email: string;
  password: string;
}

export interface SignupSchema extends LoginSchema {
  username: string;
  name: string;
  confirmPassword: string;
}

export const loginSchema = Joi.object<LoginSchema>({
  email: Joi.string()
    .email({ minDomainSegments: 2 })
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required'
    })
}).unknown(true);

export const signupSchema = Joi.object<SignupSchema>({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 30 characters',
      'string.alphanum': 'Username must only contain alphanumeric characters',
      'any.required': 'Username is required'
    }),
  name: Joi.string()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.min': 'Name must be at least 3 characters long',
      'string.max': 'Name cannot exceed 30 characters',
      'any.required': 'Name is required'
    }),
  email: Joi.string()
    .email({ minDomainSegments: 2 })
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character',
      'any.required': 'Password is required'
    }),
  confirmPassword: Joi.valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords must match',
      'any.required': 'Password confirmation is required'
    })
}).unknown(true);
