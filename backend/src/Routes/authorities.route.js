const express = require('express');
const authController = require('../controllers/auth.controller');
// const { router } = require('../app');

const router = express.Router()

// auth
router.post('/authority/login',authController.loginAuthority)
router.post('/auth/register',authController.registerScientist)


module.exports = router