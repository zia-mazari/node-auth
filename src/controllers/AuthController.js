const {loginSchema, signupSchema} = require('../utils/validations/authValidations');
const authService = require('../services/AuthService');
const httpStatus = require('http-status');


exports.login = async (req, res) => {
    // Validation
    const {error, value} = loginSchema.validate(req.body);
    if (error) {
        return res.status(httpStatus.BAD_REQUEST).json({success: false, message: 'Invalid email/password'});
    }
    const loginResponse = await authService.login(value.email, value.password);
    if (loginResponse.success) {
        return res.status(httpStatus.OK).json(loginResponse);
    } else {
        return res.status(httpStatus.UNAUTHORIZED).json(loginResponse);
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
    const signupResponse = await authService.signup(userData);
    if (signupResponse.success) {
        res.status(httpStatus.CREATED).json(signupResponse);
    } else {
        res.status(httpStatus.BAD_REQUEST).json(signupResponse);
    }
}

exports.renewAccessToken = async (req, res) => {
    try {
        const tokenResponse = await authService.renewAccessToken(req.tokenPayload);
        if (tokenResponse.success) {
            return res.status(httpStatus.OK).json({success: true, data: tokenResponse.data});
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({success: false, message: tokenResponse.message});
        }
    } catch (exc) {
        return res.status(httpStatus.UNAUTHORIZED).json({success: false, message: exc.message});
    }
}