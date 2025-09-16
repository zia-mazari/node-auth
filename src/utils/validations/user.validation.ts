import Joi from 'joi';

export interface UpdatePasswordSchema {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  logout?: boolean;
}

export interface UpdateNameSchema {
  name: string;
}

export const updatePasswordSchema = Joi.object<UpdatePasswordSchema>({
  currentPassword: Joi.string().required().messages({
    'string.empty': 'CURRENT_PASSWORD_REQUIRED',
    'any.required': 'CURRENT_PASSWORD_REQUIRED'
  }),
  newPassword: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
    .required()
    .invalid(Joi.ref('currentPassword'))
    .messages({
      'any.invalid': 'PASSWORD_SAME_AS_CURRENT',
      'string.pattern.base': 'PASSWORD_INVALID_FORMAT',
      'string.min': 'PASSWORD_TOO_SHORT',
      'string.empty': 'NEW_PASSWORD_REQUIRED',
      'any.required': 'NEW_PASSWORD_REQUIRED'
    }),
  confirmPassword: Joi.valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'PASSWORDS_MISMATCH',
    'any.required': 'CONFIRM_PASSWORD_REQUIRED'
  }),
  logout: Joi.boolean().default(false)
}).unknown(true);

export const updateNameSchema = Joi.object<UpdateNameSchema>({
  name: Joi.string().min(3).max(30).required().messages({
    'string.min': 'NAME_TOO_SHORT',
    'string.max': 'NAME_TOO_LONG',
    'string.empty': 'NAME_REQUIRED',
    'any.required': 'NAME_REQUIRED'
  })
}).unknown(true);

export interface ProfileUpdateSchema {
  fullName?: string;
  secondaryEmail?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  bio?: string;
}

export const updateProfileSchema = Joi.object<ProfileUpdateSchema>({
  fullName: Joi.string().min(3).max(50).messages({
    'string.min': 'FULLNAME_TOO_SHORT',
    'string.max': 'FULLNAME_TOO_LONG'
  }),
  secondaryEmail: Joi.string().email().messages({
    'string.email': 'INVALID_EMAIL'
  }),
  dateOfBirth: Joi.date().iso().messages({
    'date.base': 'INVALID_DATE',
    'date.format': 'INVALID_DATE_FORMAT'
  }),
  phoneNumber: Joi.string().pattern(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/).messages({
    'string.pattern.base': 'INVALID_PHONE_FORMAT'
  }),
  bio: Joi.string().max(500).messages({
    'string.max': 'BIO_TOO_LONG'
  })
}).min(1).unknown(true);