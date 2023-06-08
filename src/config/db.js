const mongoose = require('mongoose');
require('dotenv').config();

exports.connectDB = async () => {
    try {
        await mongoose.connect(`mongodb://localhost/${process.env.DB_NAME}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`Connected to DB: ${process.env.DB_NAME}`);
        return true
    } catch (error) {
        console.error(`Failed to connect to DB: ${process.env.DB_NAME}:`, error);
    }
};
