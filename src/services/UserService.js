const User = require('../models/UserModel');
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
        return {success: true, message: 'User created successfully', data: newUser};
    } catch (exc) {
        if (exc && exc.code === 11000) {
            if (exc.keyPattern && exc.keyPattern.username === 1) {
                return {success: false, message: 'Username already exists'};
            } else if (exc.keyPattern && exc.keyPattern.email === 1) {
                return {success: false, message: 'Email already exists'};
            }
            return {success: false, message: 'Failed to create user'};
        } else {
            return {success: false, message: exc.message};
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
            return {success: false, message: 'User not found'};
        }
        const isPasswordValid = await passwordHelper.comparePassword(currentPassword, user.password);
        if (!isPasswordValid) {
            return {success: false, message: 'Invalid current password'};
        }
        // Hash the new password
        user.password = await passwordHelper.hashPassword(newPassword);
        await user.save();
        return {success: true, message: 'Password updated'};
    } catch (error) {
        return {success: false, message: 'Internal server error'};
    }
};


exports.getUserByEmail = async (email) => {
    try {
        return await User.findOne({email: email});
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
