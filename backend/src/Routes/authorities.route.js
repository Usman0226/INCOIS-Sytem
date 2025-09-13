const express = require('express');
const authController = require('../controllers/auth.controller')

const route = express.Router()

router.post('/authority/login',authController.loginUser)



module.exports = route