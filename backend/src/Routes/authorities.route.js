const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth');
const Report = require('../models/report');
const serveReports = require("../controllers/authorities.controller")

const router = express.Router()

router.post('/authority/login',authController.loginAuthority)
router.post('/authority/register',authController.registerScientist)

// Get reports for scientists 
router.get('/reports', authenticateToken, serveReports);

module.exports = router