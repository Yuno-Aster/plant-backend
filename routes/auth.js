const express = require('express');
const router = express.Router();
// 1. အရင်ဆုံး ဒီ line ကို ပြင်ပါ (config file ကနေ admin ကို ခေါ်ပါ)
const admin = require('../config/firebaseAdmin'); 
const User = require('../models/user_model'); 

// Sync Route
router.post('/sync', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        // ၁။ Header စစ်ဆေးခြင်း
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "No token provided" });
        }

        const idToken = authHeader.split('Bearer ')[1];

        // ၂။ Firebase Token Verify လုပ်ခြင်း (ဒီနေရာမှာ admin.auth() ကို သုံးပါ)
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { uid, email, name } = decodedToken;

        // ၃။ MongoDB ထဲမှာ User ကို ရှာ/ထည့်ခြင်း (Upsert)
        const user = await User.findOneAndUpdate(
            { uid: uid }, 
            { 
                $set: { 
                    email: email, 
                    displayName: name || "New User" 
                } 
            }, 
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );

        console.log("✅ User Synced & Saved to DB:", uid);
        res.status(200).json({ message: "Sync Success", user: user });

    } catch (error) {
        console.error("❌ Sync Error:", error);
        res.status(500).json({ message: "Sync failed", error: error.message });
    }
});

module.exports = router;