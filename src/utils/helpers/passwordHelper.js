const bcrypt = require('bcrypt');
const {number} = require("joi");
require('dotenv').config();

// Generate a hashed password
exports.hashPassword = async (password) => {
    return await bcrypt.hash(password, parseInt(process.env.PASSWORD_SALT_ROUNDS, 10));
};

// Compare a password with a hashed password
exports.comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};