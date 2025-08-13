const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Message = require('./models/message');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ DB Error:', err));

const payloadDir = path.join(__dirname, 'sample_payloads');

fs.readdirSync(payloadDir).forEach(file => {
  if (file.endsWith('.json')) {
    const data = JSON.parse(fs.readFileSync(path.join(payloadDir, file), 'utf-8'));

    // Navigate to messages inside your payload
    try {
      const change = data.metaData.entry[0].changes[0];
      const value = change.value;

      // Insert messages
      if (value.messages && Array.isArray(value.messages)) {
        const contact = value.contacts[0];
        value.messages.forEach(async msg => {
          await Message.updateOne(
            { id: msg.id },
            {
              id: msg.id,
              meta_msg_id: null, // Not present in your sample
              wa_id: contact.wa_id || null,
              name: contact.profile?.name || null,
              text: msg.text?.body || '',
              status: 'sent',
              timestamp: new Date(parseInt(msg.timestamp) * 1000)
            },
            { upsert: true }
          );
        });
      }

      // Status updates (if any future payloads have them)
      if (value.statuses && Array.isArray(value.statuses)) {
        value.statuses.forEach(async st => {
          await Message.updateOne(
            { id: st.id },
            { $set: { status: st.status } }
          );
        });
      }
    } catch (err) {
      console.error(`❌ Error processing file ${file}:`, err.message);
    }
  }
});

console.log('📌 Payload processing completed.');
