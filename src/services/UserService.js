const User = require('../models/UserModel');
const httpStatus = require("http-status");
const bcrypt = require("bcrypt");
const passwordHelper = require('../utils/helpers/passwordHelper');

exports.getUsers = async (req) => {
    try {
        return await User.find({});
    } catch (exc) {

    }
}

exports.createUser = async (userData) => {
    try {
        const newUser = new User(userData);
        await newUser.save();
        return newUser;
    } catch (exc) {
        if (exc && exc.code === 11000) {
            if (exc.keyPattern && exc.keyPattern.username === 1) {
                throw new Error('Username already exists');
            } else if (exc.keyPattern && exc.keyPattern.email === 1) {
                throw new Error('Email already exists');
            } else {
                throw new Error('Failed to create user');
            }
        } else {
            throw new Error(exc);
        }
    }
}

exports.updateUser = async (req, res) => {

}


exports.deleteUser = async (req, res) => {

}

exports.getUserById = async (req, res) => {

}

exports.updatePassword = async (userId, currentPassword, newPassword) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        const isPasswordValid = await passwordHelper.comparePassword(currentPassword, user.password);

        if (!isPasswordValid) {
            throw new Error('Invalid current password');
        }
        // Hash the new password
        user.password = await passwordHelper.hashPassword(newPassword);
        return user.save();
    } catch (error) {
        console.error('Error updating password:', error);
        throw new Error('Internal server error');
    }
};


exports.getUserByEmail = async (email) => {
    try {
        return User.findOne({email: email});
    } catch (exc) {
        throw new Error(exc.message);
    }
}

exports.getUserByUsername = async (username) => {
    try {
        return User.findOne({username});
    } catch (exc) {
        throw new Error(exc.message);
    }
}

exports.isEmailExist = async (email) => {
    try {
        return User.findOne({email}).select('email');
    } catch (exc) {
        throw new Error(exc.message);
    }
}

exports.isUserNameExist = async (username) => {
    try {
        return User.findOne({username}).select('username');
    } catch (exc) {
        throw new Error(exc.message);
    }
}

exports.updateToken = async (userId, token, maxAllowedTokens = 5) => {
    try {
        const user = await User.findById(userId).select('tokens');
        if (user) {
            user.tokens.push(token);
        }
        if (user.tokens.length > maxAllowedTokens) {
            // Remove the first token from the array
            user.tokens.shift();
        }
        return user.save();
    } catch (exc) {
        throw new Error(exc.message);
    }
}
