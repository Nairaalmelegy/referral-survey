const express = require("express");
const router = express.Router();
const { submitSurvey, getStats, startSurvey } = require("../controllers/survey.controller");

// Start page (reads ?ref=CODE)
router.get("/start", startSurvey);

// Submit survey
router.post("/submit", submitSurvey);

// Stats for a referral code
router.get("/ref/:code/stats", getStats);

module.exports = router;