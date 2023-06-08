const express = require('express');
const {login, signup, renewAccessToken} = require("../controllers/AuthController");
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/auth/login', login);
router.post('/auth/signup', signup);
router.get('/auth/refresh-token', authMiddleware.authenticateRefreshToken, renewAccessToken);

module.exports = router;