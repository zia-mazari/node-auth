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
  currentPassword: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
    .required()
    .invalid(Joi.ref('currentPassword'))
    .messages({
      'any.invalid': 'New password must be different from the current password',
      'string.pattern.base': 'New password must contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character',
    }),
  confirmPassword: Joi.valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Confirm password must match with new password'
  }),
  logout: Joi.boolean().default(false)
}).unknown(true);

export const updateNameSchema = Joi.object<UpdateNameSchema>({
  name: Joi.string().min(3).max(30).required()
}).unknown(true);
