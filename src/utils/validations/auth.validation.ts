import Joi from 'joi';

export interface LoginSchema {
  email: string;
  password: string;
}

export interface SignupSchema extends LoginSchema {
  username: string;
  confirmPassword: string;
}

export interface ForgotPasswordSchema {
  email: string;
}

export interface ResetPasswordSchema {
  verificationCode: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ValidateTokenSchema {
  verificationCode: string;
}

export const loginSchema = Joi.object<LoginSchema>({
  email: Joi.string()
    .email({ minDomainSegments: 2 })
    .required()
    .messages({
      'string.email': 'INVALID_EMAIL',
      'string.empty': 'EMAIL_REQUIRED',
      'any.required': 'EMAIL_REQUIRED'
    }),
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'PASSWORD_REQUIRED',
      'any.required': 'PASSWORD_REQUIRED'
    })
}).unknown(true);

export const signupSchema = Joi.object<SignupSchema>({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.min': 'USERNAME_TOO_SHORT',
      'string.max': 'USERNAME_TOO_LONG',
      'string.alphanum': 'USERNAME_INVALID_CHARS',
      'any.required': 'USERNAME_REQUIRED'
    }),
  email: Joi.string()
    .email({ minDomainSegments: 2 })
    .required()
    .messages({
      'string.email': 'INVALID_EMAIL',
      'string.empty': 'EMAIL_REQUIRED',
      'any.required': 'EMAIL_REQUIRED'
    }),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
    .required()
    .messages({
      'string.min': 'PASSWORD_TOO_SHORT',
      'string.pattern.base': 'PASSWORD_INVALID_FORMAT',
      'any.required': 'PASSWORD_REQUIRED'
    }),
  confirmPassword: Joi.valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'PASSWORDS_MISMATCH',
      'any.required': 'CONFIRM_PASSWORD_REQUIRED'
    })
}).unknown(true);

export const forgotPasswordSchema = Joi.object<ForgotPasswordSchema>({
  email: Joi.string()
    .email({ minDomainSegments: 2 })
    .required()
    .messages({
      'string.email': 'INVALID_EMAIL',
      'string.empty': 'EMAIL_REQUIRED',
      'any.required': 'EMAIL_REQUIRED'
    })
}).unknown(true);

export const resetPasswordSchema = Joi.object<ResetPasswordSchema>({
  verificationCode: Joi.string()
    .length(6)
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
      'string.empty': 'VERIFICATION_CODE_REQUIRED',
      'string.length': 'VERIFICATION_CODE_MUST_BE_6_DIGITS',
      'string.pattern.base': 'VERIFICATION_CODE_MUST_BE_6_DIGITS',
      'any.required': 'VERIFICATION_CODE_REQUIRED'
    }),
  newPassword: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
    .required()
    .messages({
      'string.min': 'PASSWORD_TOO_SHORT',
      'string.pattern.base': 'PASSWORD_INVALID_FORMAT',
      'any.required': 'PASSWORD_REQUIRED'
    }),
  confirmPassword: Joi.valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'PASSWORDS_MISMATCH',
      'any.required': 'CONFIRM_PASSWORD_REQUIRED'
    })
}).unknown(true);

export const validateTokenSchema = Joi.object<ValidateTokenSchema>({
  verificationCode: Joi.string()
    .length(6)
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
      'string.empty': 'VERIFICATION_CODE_REQUIRED',
      'string.length': 'VERIFICATION_CODE_MUST_BE_6_DIGITS',
      'string.pattern.base': 'VERIFICATION_CODE_MUST_BE_6_DIGITS',
      'any.required': 'VERIFICATION_CODE_REQUIRED'
    })
}).unknown(true);