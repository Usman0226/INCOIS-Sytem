const express = require("express");
// const Report = require("../models/report");
const rateLimit = require("express-rate-limit");

const router = express.Router();
const {validateReport} = require("../controllers/user.controller")

const reportLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 5,
  message: { error: "Too many reports from this user, try later !." }
});


router.post("/submit/report",reportLimiter,validateReport);

// router.get('/')

module.exports = router;