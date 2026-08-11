require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');

require('./config/firebaseAdmin');

// Scraper service သို့မဟုတ် utils မှ function ကို တိုက်ရိုက်ချိတ်ဆက်ခြင်း
// (သင့်ဘက်က ဖိုင်တည်နေရာအပေါ်မူတည်၍ utils/scraper သို့မဟုတ် services/riceScraper ကို သုံးနိုင်သည်)
const { scrapeRicePrices } = require('./utils/scraper'); 

const app = express();

app.use(cors());

// 📌 Base64 ပုံကြီးများ လက်ခံနိုင်ရန် JSON limit ကို 10mb သို့ တိုးမြှင့်ခြင်း
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 📌 ပုံများကို Browser မှ တိုက်ရိုက်ကြည့်ရှုနိုင်ရန် Static Folder ချိတ်ပေးခြင်း
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/argolens')
  .then(() => console.log("🍃 MongoDB Connected Successfully!"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Routes 
const authRoutes = require('./routes/auth');
const noteRoutes = require('./routes/notes');
const chatRoutes = require('./routes/chatRoutes');
const riceRoutes = require('./routes/riceRoutes');
const historyVoucherRoutes = require('./routes/historyVoucherRoutes'); 
const riceSuggestionRoutes = require('./routes/riceSuggestions');

app.use('/auth', authRoutes);
app.use('/notes', noteRoutes);
app.use('/chat', chatRoutes);
app.use('/api/rices', riceRoutes);

// 🛠 Flutter ဘက်က /api/history-vouchers နှင့် တိုက်ရိုက်ကိုက်ညီစေရန်
app.use('/api/history-vouchers', historyVoucherRoutes); 

app.use('/api', riceSuggestionRoutes);

// ⏰ နေ့စဉ် စပါးဈေးနှုန်း အလိုအလျောက် ဆွဲယူရန် (Cron Job)
// Server စတင်ချိန်တွင် တစ်ခါ စပါးဈေး ဝင်ဆွဲခိုင်းမည်
if (typeof scrapeRicePrices === 'function') {
    scrapeRicePrices();
}

// နေ့စဉ် မနက် ၈ နာရီတိုင်းတွင် စပါးဈေး အလိုအလျောက် သွားဆွဲရန်
cron.schedule('0 8 * * *', () => {
    console.log("⏰ Running daily scheduled rice price scraper...");
    if (typeof scrapeRicePrices === 'function') {
        scrapeRicePrices();
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});