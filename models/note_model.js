const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    uid: { type: String, required: true }, // ဘယ် User ရဲ့ Note လဲဆိုတာ သိဖို့
    title: { type: String, required: true },
    content: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Note', noteSchema);