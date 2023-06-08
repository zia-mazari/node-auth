const express = require('express');
const router = express.Router();

const {
    updatePassword
} = require('../controllers/UserController');


router.put('/user/update-password', updatePassword);

module.exports = router;