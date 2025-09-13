const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authenticateToken = require('../middleware/auth')


router.post('/user/register',authController.register)
router.post('/verify-otp',authController.verifyOTP)
router.post('/resend-otp',authController.resendOTP)


module.exports = router;
