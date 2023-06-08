const {loginSchema, signupSchema} = require('../utils/validations/authValidations');
const authService = require('../services/AuthService');
const httpStatus = require('http-status');


exports.login = async (req, res) => {
    // Validation
    const {error, value} = loginSchema.validate(req.body);
    if (error) {
        return res.status(httpStatus.BAD_REQUEST).json({success: false, message: 'Invalid email/password'});
    }
    const user = await authService.login(value.email, value.password);
    if (user.success) {
        return res.status(httpStatus.OK).json(user);
    } else {
        return res.status(httpStatus.UNAUTHORIZED).json(user);
    }
}

exports.signup = async (req, res) => {
    // Validation
    const {error, value} = signupSchema.validate(req.body);
    if (error) {
        return res.status(httpStatus.BAD_REQUEST).json({error: error.details});
    }
    const userData = {
        username: value.username,
        email: value.email,
        name: value.name,
        password: value.password,
        token: null
    }
    const user = await authService.signup(userData);
    if (user.success) {
        res.status(httpStatus.CREATED).json({success: true, message: "You're signed up successfully."});
    } else {
        res.status(httpStatus.BAD_REQUEST).json({error: user.message});
    }
}

exports.renewAccessToken = async (req, res) => {
    try {
        const tokens = await authService.renewAccessToken(req.tokenPayload);
        return res.status(httpStatus.OK).json({success: true, data: tokens});
    } catch (exc){
        return res.status(httpStatus.UNAUTHORIZED).json({success: false, message: exc.message});
    }
}