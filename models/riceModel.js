const mongoose = require('mongoose');

const riceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  market_value: { type: String, required: true },
  region: { type: String, required: true, default: 'Shwebo' }
}, { timestamps: true });

module.exports = mongoose.model('Rice', riceSchema);