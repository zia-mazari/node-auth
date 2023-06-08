const jwt = require('jsonwebtoken');
require('dotenv').config();
const httpStatus = require('http-status');

// Middleware function to authenticate JWT token
exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(httpStatus.UNAUTHORIZED).json({message: 'Missing token'});
    }

    try {
        // Store the user object in the request for further use
        const payload = jwt.verify(token, process.env.JWT_SECRET, {ignoreExpiration: false});
        if (payload.token.type !== 'access') {
            return res.status(httpStatus.UNAUTHORIZED).json({message: 'Invalid token'});
        }
        req.tokenPayload = payload;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(httpStatus.UNAUTHORIZED).json({message: 'Token expired'});
        }
        return res.status(httpStatus.UNAUTHORIZED).json({message: 'Unauthorized'});
    }
};

// Middleware function to authenticate JWT expiry token
exports.authenticateRefreshToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(httpStatus.UNAUTHORIZED).json({message: 'Missing token'});
    }
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        // If token type is access token, check token expiry
        if (payload.token.type === 'access') {
            const currentTimestamp = Math.floor(Date.now() / 1000); // Current timestamp in seconds
            if (payload.exp && payload.exp < currentTimestamp) {
                return res.status(httpStatus.UNAUTHORIZED).json({message: 'Token expired'});
            }
        }
        // Store the token payload object in the request for further use
        req.tokenPayload = payload;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(httpStatus.UNAUTHORIZED).json({message: 'Token expired'});
        }
        return res.status(httpStatus.UNAUTHORIZED).json({message: 'Unauthorized'});
    }
};
