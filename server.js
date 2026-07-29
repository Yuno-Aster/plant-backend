require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

require('./config/firebaseAdmin');

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/argolens')
  .then(() => console.log("🍃 MongoDB Connected Successfully!"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Routes (ရှိပြီးသား အဟောင်းများနှင့် အသစ်ထည့်မည့် စပါးဈေးနှုန်း Route များ)
const authRoutes = require('./routes/auth');
const noteRoutes = require('./routes/notes');
const chatRoutes = require('./routes/chatRoutes');
const riceRoutes = require('./routes/riceRoutes'); // 👈 စပါးဈေးနှုန်းများအတွက် Route အသစ်

app.use('/auth', authRoutes);
app.use('/notes', noteRoutes);
app.use('/chat', chatRoutes);
app.use('/api/rices', riceRoutes); // 👈 Flutter App မှ Admin Panel ဖြင့် ချိတ်မည့်လိပ်စာ

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});