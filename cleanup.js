require('dotenv').config();
const mongoose = require('mongoose');
const Message = require('./models/message');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    const result = await Message.deleteMany({
      $or: [
        { text: { $exists: false } },
        { name: { $exists: false } },
        { text: "" },
        { name: "" }
      ]
    });

    console.log(`🗑 Deleted ${result.deletedCount} invalid messages`);
    process.exit();
  })
  .catch(err => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
