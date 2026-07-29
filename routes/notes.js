const express = require('express');
const router = express.Router();
const admin = require('../config/firebaseAdmin');
const Note = require('../models/note_model');

// Middleware: Token စစ်ဆေးခြင်း
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).send('Unauthorized');
    
    try {
        const token = authHeader.split('Bearer ')[1];
        const decoded = await admin.auth().verifyIdToken(token);
        req.user = decoded; // User info ကို request ထဲထည့်ပေး
        next();
    } catch (e) {
        res.status(401).send('Invalid Token');
    }
};

// 1. Get Notes
router.get('/', verifyToken, async (req, res) => {
    const notes = await Note.find({ uid: req.user.uid });
    res.json(notes);
});

// 2. Save Note
router.post('/save', verifyToken, async (req, res) => {
    const newNote = new Note({ ...req.body, uid: req.user.uid });
    await newNote.save();
    res.json({ message: "Saved" });
});

// 3. Update Note
router.put('/update/:id', verifyToken, async (req, res) => {
    await Note.findOneAndUpdate({ _id: req.params.id, uid: req.user.uid }, req.body);
    res.json({ message: "Updated" });
});

// 4. Delete Note
router.delete('/delete/:id', verifyToken, async (req, res) => {
    await Note.findOneAndDelete({ _id: req.params.id, uid: req.user.uid });
    res.json({ message: "Deleted" });
});

module.exports = router;