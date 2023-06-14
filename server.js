const express = require('express');
const {connectDB} = require('./src/config/db');
const routes = require('./src/routes');
const app = express();
require('dotenv').config();

// Middleware
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/', routes);


const port = process.env.APP_PORT;
app.listen(port, () => {
    console.log(`Server started at port: ${port}`);
});