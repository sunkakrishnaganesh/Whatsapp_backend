require('dotenv').config();  // Load environment variables

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const Message = require('./models/message');

// Set up multer storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Store files in the "uploads" folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Generate unique filename
  },
});

const upload = multer({ storage: storage });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('uploads')); // Serve uploaded files

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});

// Get all messages
app.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 }); // oldest first
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send a new message with optional file upload
app.post('/messages', upload.single('file'), async (req, res) => {
  try {
    const { name, text } = req.body;
    const file = req.file ? req.file.filename : null; // Get file name from upload

    if (!name || !text) {
      return res.status(400).json({ error: 'Name and text are required' });
    }

    const newMessage = new Message({
      name,
      text,
      timestamp: new Date(),
      file, // Include the file name in the message
    });

    await newMessage.save();

    // Return the message with the file URL (if file exists)
    const fileUrl = file ? `${req.protocol}://${req.get('host')}/uploads/${file}` : null;
    res.status(201).json({ ...newMessage.toObject(), fileUrl }); // Send file URL in the response

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
