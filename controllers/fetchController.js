const { spawn } = require('child_process');
const path = require('path');
const mongoose = require('mongoose');
const getMessageModel = require('../models/messageModel'); // Import the model function

//py script exe
function handleFetchMessages(req, res) {
  const { user_channel_word, user_msg_word, message_limit } = req.body;
  const collectionName = "fetch_data"; // The constant collection name
  console.log(`[Fetch] Channel search term: ${user_channel_word}, Message search term: ${user_msg_word}, Collection: ${collectionName}, Limit: ${message_limit}`);

  const TELEGRAM_API_ID = process.env.TELEGRAM_API_ID;
  const TELEGRAM_API_HASH = process.env.TELEGRAM_API_HASH;

  const pythonArgs = [
    './py_scripts/fetch_backend_msg.py',
    user_channel_word,
    user_msg_word,
    collectionName,
    TELEGRAM_API_ID,
    TELEGRAM_API_HASH,
    message_limit
  ];

  const pythonProcess = spawn('python', pythonArgs);

  let result = '';

  pythonProcess.stdout.on('data', (data) => {
    result += data.toString();
    console.log(`[Python] stdout: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`[Python] stderr: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`[Fetch] Process completed with code ${code}`);
    res.status(200).json({
      message: 'Messages fetched successfully!',
      result: result
    });
  });
}

async function fetchMessagesFromDB(req, res) {
  const collectionName = "fetch_data"; // The constant collection name
  try {
    console.log(`[Fetch DB] Fetching from collection: ${collectionName}`);
    const MessageModel = getMessageModel(collectionName);
    console.log(`[Fetch DB] Using Mongoose model for collection: ${collectionName}`);
    console.log(`[Fetch DB] Mongoose Schema Paths for Collection ${collectionName}:`, MessageModel.schema.paths);

    // Fetch messages, ensure all fields match the stored documents
    const data = await MessageModel.find({}, {
      chat_name: 1,
      chat_id: 1,
      message_id: 1,
      message_text: 1,
      user_id: 1,
      date: 1,
      fetch_time: 1,
      _id: 0 // Exclude the default MongoDB _id field
    }).exec();

    if (data.length === 0) {
      console.warn(`[Fetch DB] No data found in collection: ${collectionName}`);
    } else {
      console.log(`[Fetch DB] Data fetched successfully from collection: ${collectionName}`);
    }

    console.log(`[Fetch DB] Data fetched: `, JSON.stringify(data, null, 2));
    res.status(200).json(data);
  } catch (error) {
    console.error(`[Fetch DB] Error fetching messages from MongoDB: ${error}`);
    res.status(500).json({ error: 'Failed to fetch data from MongoDB' });
  }
}

module.exports = {
  handleFetchMessages,
  fetchMessagesFromDB,
};
