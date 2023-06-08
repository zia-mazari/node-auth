const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

const autRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');

router.use('/api/', autRoutes);
router.use('/api/', authMiddleware.authenticateToken, userRoutes);

module.exports = router;
