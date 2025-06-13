const express = require('express');
const router = express.Router();
const wordCloudController = require('../controllers/wordCloudController');

router.post('/', wordCloudController.createWordCloud);

router.get('/:id', wordCloudController.getWordCloud);

module.exports = router;