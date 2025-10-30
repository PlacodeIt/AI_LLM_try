const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const fetchRoutes = require('./routes/fetchRoutes');
const loginController = require('./controllers/loginController');
const getMessageModel = require('./models/messageModel'); 
const modelRoutes = require('./routes/modelRoutes');


const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000', 
    methods: 'GET,POST',
}));

// mongo connection
const mongoURI = 'mongodb://localhost:27017/telegram_data'; 
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

// route to login steps 
app.post('/login', (req, res) => {
    console.log('Request received at /login:', req.body);
    loginController.handleLogin(req, res);
});

// route to session and credentials check
app.get('/check-session', (req, res) => {
    const userName = req.query.user || 'default_user'; // User can specify their session folder name
    const sessionCheck = loginController.checkSessionAndCredentials(userName);
    res.json(sessionCheck);
});

app.use(modelRoutes);
app.use(fetchRoutes);


// Route to handle manual collection refresh
app.get('/refresh-collection', async (req, res) => {
    const collectionName = "fetch_data"; // Constant collection name
    try {
        await refreshCollection(collectionName);
        res.status(200).json({ message: `Collection ${collectionName} refreshed successfully.` });
    } catch (error) {
        res.status(500).json({ error: `Failed to refresh collection: ${error.message}` });
    }
});

// route to fetch messages from MongoDB using the model
app.get('/api/fetch-messages-from-model', async (req, res) => {
    const collectionName = "fetch_data"; 
    try {
        const MessageModel = getMessageModel(collectionName);
        const messages = await MessageModel.find({}, { _id: 0 }).exec(); 
        if (messages.length === 0) {
            console.log(`[Fetch DB] No data found in collection: ${collectionName}`);
        } else {
            console.log(`[Fetch DB] Data fetched from collection: ${collectionName}`);
        }
        res.status(200).json(messages);
    } catch (error) {
        console.error(`[Fetch DB] Error fetching messages from MongoDB: ${error}`);
        res.status(500).json({ error: 'Failed to fetch data from MongoDB' });
    }
});




const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
