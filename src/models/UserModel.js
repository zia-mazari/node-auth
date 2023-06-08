const mongoose = require('mongoose');
const {string} = require("joi");

// Define the User schema
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            minlength: 3,
            maxlength: 100
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        tokens: [
            {
                rtv: {
                    type: String,
                    required: true,
                },
            },
        ],
    },
    {
        timestamps: true,
        versionKey: false
    });

// Add index on email field
userSchema.index({email: 1});

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
