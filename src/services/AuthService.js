const bcrypt = require('bcrypt');
const userService = require('./UserService');
const tokenHelper = require('../utils/helpers/tokenHelper');
const User = require("../models/UserModel");
require('dotenv').config();

exports.login = async (email, password) => {
    const user = await userService.getUserByEmail(email);
    if (user) {
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {
            const {accessToken, refreshToken, tokenVersion} = await tokenHelper.generateAccessTokens(user);
            const updateResponse = await tokenHelper.updateTokens(user, {rtv: tokenVersion});
            if(updateResponse.success){
                return {success: true, data: {refreshToken, accessToken}}
            }
            return updateResponse;
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
            const userResponse = await userService.createUser(userData);
            if (userResponse.success) {
                return {success: true, message: 'Signed up successfully'};
            } else {
                return {success: false, message: userResponse.message};
            }
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
            return {success: false, message: 'User not found'}
        }

        if (!user.tokens || user.tokens.length === 0) {
            return {success: false, message: 'User not found'}
        }

        // Find the index of the matching token by version
        const matchingTokenIndex = user.tokens.findIndex((token) => token.rtv === tokenPayload.token.version);

        if (matchingTokenIndex === -1) {
            return {success: false, message: 'Invalid token'};
        }

        // Generate new access token, refresh token, and token version
        const {accessToken, refreshToken, tokenVersion} = await tokenHelper.generateAccessTokens(user);

        // Update the matching token or insert a new token with the updated version
        if (matchingTokenIndex !== -1) {
            // Update the existing token
            user.tokens[matchingTokenIndex].rtv = tokenVersion;
        } else {
            // Insert a new token
            user.tokens.push({device: tokenPayload.device, rtv: tokenVersion});
        }
        await user.save();
        return {success: true, data: {accessToken, refreshToken}};
    } catch (exc) {
        return {success: false, message: exc.message};
    }
};