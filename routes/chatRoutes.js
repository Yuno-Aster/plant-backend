const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const upload = require('../middleware/upload');

// 1. Chat အသစ်စတင်ခြင်း သို့မဟုတ် စာပို့ခြင်း
router.post('/send', upload.single('image'), chatController.handleChat);

// 2. User ၏ Chat History အားလုံးကို ဆွဲယူခြင်း
router.get('/history', chatController.getHistory);

// 3. Chat တစ်ခုချင်းစီ၏ Messages များကို ဆွဲယူခြင်း (အသစ်ထည့်လိုက်ပါ)
router.get('/messages/:chatId', chatController.getChatMessages);

// 4. Chat တစ်ခုကို ဖျက်ခြင်း
router.delete('/delete/:id', chatController.deleteChat);

module.exports = router;