const mongoose = require('mongoose');

const ricePriceSchema = new mongoose.Schema({
    name: { type: String, required: true },         // စပါး သို့မဟုတ် ပစ္စည်းအမည် (ဥပမာ - ရွှေဘိုပေါ်ဆန်း)
    market_value: { type: String, required: true }, // ဈေးနှုန်း (ဥပမာ - 150000)
    category: { type: String, default: 'rice' },    // 'rice' သို့မဟုတ် 'byproduct'
    region: { type: String, default: 'Yangon' },    // Yangon, Mandalay, Shwebo, Ayeyarwady, Bago
    updatedBy: { type: String, default: 'Auto-Scraper' },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RicePrice', ricePriceSchema);