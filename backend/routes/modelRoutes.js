const express = require('express');
const router = express.Router();
const modelController = require('../controllers/modelController');

// route to run the model
router.post('/api/run-model', modelController.runModel);

module.exports = router;
