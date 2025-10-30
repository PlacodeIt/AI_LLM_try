const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

// route to handle login steps
router.post('/login', loginController.handleLogin);

module.exports = router;
