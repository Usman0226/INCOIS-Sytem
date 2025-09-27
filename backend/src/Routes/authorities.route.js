const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth');
const VerifiedReport = require("../models/verifiedReports");
const Report = require("../models/report");

const {serveReports,verifyReports} = require("../controllers/authorities.controller")

const router = express.Router()

router.post('/authority/login',authController.loginAuthority)
router.post('/authority/register',authController.registerScientist)

// Get reports for scientists 
// router.get('/reports', authenticateToken, serveReports);
router.get('/get/reports', serveReports);
router.post("/:id/verify",verifyReports );

module.exports = router