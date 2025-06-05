const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');

router.post('/google', calendarController.addGoogleCalendarEvent);

router.post('/ical', calendarController.addIcalEvent);

module.exports = router;