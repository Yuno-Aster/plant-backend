const mongoose = require('mongoose');

const riceSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  market_value: { 
    type: String, 
    required: true, 
    trim: true 
  },
  region: { 
    type: String, 
    required: true, 
    default: 'Shwebo', 
    trim: true 
  },
  category: { 
    type: String, 
    required: true, 
    enum: ['rice', 'byproduct'], // စပါး သို့မဟုတ် ဘေးထွက်ပစ္စည်းများ (ဖွဲ၊ ကောက်ရိုး)
    default: 'rice' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Rice', riceSchema);