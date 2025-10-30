const mongoose = require('mongoose');

// Schema
const MessageSchema = new mongoose.Schema({
  chat_name: { type: String, required: true },
  chat_id: { type: Number, required: true },
  message_id: { type: Number, required: true },
  message_text: { type: String, required: true },
  user_id: { type: mongoose.Schema.Types.Mixed, required: true }, 
  date: { type: Date, required: true },
  fetch_time: { type: Date, default: Date.now }
});


const getMessageModel = (collectionName) => {
  if (!mongoose.connection.models[collectionName]) {
    return mongoose.model(collectionName, MessageSchema, collectionName);
  }
  // Return the Schema
  return mongoose.connection.models[collectionName];
};


module.exports = getMessageModel;