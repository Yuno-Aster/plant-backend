// models/ChatSession.js
const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    title: { type: String, default: "New Chat" },
    messages: [{ role: String, content: String, timestamp: { type: Date, default: Date.now } }],
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatSession', ChatSchema);