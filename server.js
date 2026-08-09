require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

require('./config/firebaseAdmin');

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
const diseaseRoutes = require('./routes/diseaseRoutes'); 
const riceSuggestionRoutes = require('./routes/riceSuggestions');

app.use('/auth', authRoutes);
app.use('/notes', noteRoutes);
app.use('/chat', chatRoutes);
app.use('/api/rices', riceRoutes);

// 🛠 ပြင်ဆင်ပြီးပါပြီ - Flutter ဘက်က /api/history-vouchers နှင့် တိုက်ရိုက်ကိုက်ညီစေရန်
app.use('/api/history-vouchers', historyVoucherRoutes); 

app.use('/api/disease', diseaseRoutes); 
app.use('/api', riceSuggestionRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});