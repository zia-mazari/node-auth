const Joi = require('joi');

exports.loginSchema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required()
}).unknown(true);

exports.signupSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string()
        .min(8)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
        .required()
        .messages({
            'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character',
        }),
    confirmPassword: Joi.valid(Joi.ref('password')).required(),
}).unknown(true);
