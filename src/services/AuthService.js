const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userService = require('./UserService');
const {v4: uuidv4} = require('uuid');
const User = require("../models/UserModel");
require('dotenv').config();

exports.login = async (email, password) => {
    const user = await userService.getUserByEmail(email);
    if (user) {
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {
            const {accessToken, refreshToken, tokenVersion} = await generateAccessTokens(user);

            await userService.updateToken(user.id, {rtv: tokenVersion});
            return {success: true, data: {refreshToken, accessToken}}
        } else {
            return {success: false, message: 'Invalid email/password'}
        }
    } else {
        return {success: false, message: 'Invalid email/password'}
    }
};

exports.signup = async (userData) => {
    try {
        const [isEmailExist, isUsernameExist] = await Promise.all([
            await userService.isEmailExist(userData.email),
            await userService.isUserNameExist(userData.username)
        ]);
        if (!isEmailExist && !isUsernameExist) {
            // Hash the password
            userData.password = await bcrypt.hash(userData.password, 10);
            await userService.createUser(userData);
            return {success: true, message: 'User created successfully'}
        } else if (isEmailExist) {
            return {success: false, message: 'Email should be unique'}
        } else if (isUsernameExist) {
            return {success: false, message: 'Username should be unique'}
        }
    } catch (exc) {
        return {success: false, message: exc.message}
    }
};

exports.renewAccessToken = async (tokenPayload) => {
    try {
        const user = await User.findById(tokenPayload.user.id).select('tokens');
        if (!user) {
            throw new Error('User not found');
        }

        if (!user.tokens || user.tokens.length === 0) {
            throw new Error('No tokens found for the user');
        }

        // Find the index of the matching token by version
        const matchingTokenIndex = user.tokens.findIndex((token) => token.rtv === tokenPayload.token.version);

        if (matchingTokenIndex === -1) {
            throw new Error('Invalid token');
        }

        // Generate new access token, refresh token, and token version
        const { accessToken, refreshToken, tokenVersion } = await generateAccessTokens(user);

        // Update the matching token or insert a new token with the updated version
        if (matchingTokenIndex !== -1) {
            // Update the existing token
            user.tokens[matchingTokenIndex].rtv = tokenVersion;
        } else {
            // Insert a new token
            user.tokens.push({ device: tokenPayload.device, rtv: tokenVersion });
        }
        await user.save();

        return {
            accessToken: accessToken,
            refreshToken: refreshToken
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

const generateAccessTokens = async (user) => {
    const tokenVersion = uuidv4();
    const refreshToken = jwt.sign({user: {id: user.id}, token: {type: 'refresh', version: tokenVersion}},
        process.env.JWT_SECRET, {expiresIn: '1w'});
    const accessToken = jwt.sign({user: {id: user.id}, token: {type: 'access', version: tokenVersion}},
        process.env.JWT_SECRET, {expiresIn: '8h'});

    return {accessToken, refreshToken, tokenVersion}
};