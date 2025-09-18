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
  firstName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  profilePicture?: string;
}

export const updateProfileSchema = Joi.object<ProfileUpdateSchema>({
  firstName: Joi.string().min(2).max(50).messages({
    'string.min': 'FIRSTNAME_TOO_SHORT',
    'string.max': 'FIRSTNAME_TOO_LONG'
  }),
  lastName: Joi.string().min(2).max(50).messages({
    'string.min': 'LASTNAME_TOO_SHORT',
    'string.max': 'LASTNAME_TOO_LONG'
  }),
  gender: Joi.string().valid('male', 'female', 'other').messages({
    'any.only': 'INVALID_GENDER'
  }),
  dateOfBirth: Joi.date().iso()
    .min(new Date(Date.now() - 85 * 365.25 * 24 * 60 * 60 * 1000))
    .max(new Date(Date.now() - 10 * 365.25 * 24 * 60 * 60 * 1000))
    .messages({
      'date.base': 'INVALID_DATE',
      'date.format': 'INVALID_DATE_FORMAT',
      'date.min': 'USER_TOO_OLD',
      'date.max': 'USER_TOO_YOUNG'
    }),
  phoneNumber: Joi.string().messages({
    'string.base': 'PHONE_MUST_BE_STRING'
  }),
  profilePicture: Joi.string().uri().messages({
    'string.uri': 'INVALID_PROFILE_PICTURE_URL'
  })
}).min(1).messages({
  'object.min': 'AT_LEAST_ONE_FIELD_REQUIRED'
});