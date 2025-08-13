require('dotenv').config();
const mongoose = require('mongoose');
const Message = require('./models/message');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    await Message.deleteMany({});
    await Message.insertMany([
      { name: "Krishna", text: "Hello, World!", status: "sent", timestamp: new Date() },
      { name: "Anita Sharma", text: "How are you?", status: "delivered", timestamp: new Date() }
    ]);
    console.log("✅ Seed data inserted");
    process.exit();
  })
  .catch(err => console.error(err));
