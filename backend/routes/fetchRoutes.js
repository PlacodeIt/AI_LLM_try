const express = require('express');
const router = express.Router();
const fetchController = require('../controllers/fetchController');

// route to fetch messages 
router.post('/api/fetch-messages', (req, res) => {
    req.body.user_name_collection = "fetch_data"; 
    fetchController.handleFetchMessages(req, res);
});

// route to get messages from db
router.get('/api/channels', (req, res) => {
    req.query.collectionName = "fetch_data";
    fetchController.fetchMessagesFromDB(req, res);
});

module.exports = router;
