const express = require('express');
const router = express.Router();
const wordCloudController = require('../controllers/wordCloudController');

router.get('/', wordCloudController.createWordCloud);

module.exports = router;
