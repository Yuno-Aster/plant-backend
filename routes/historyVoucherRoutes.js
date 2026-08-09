const express = require('express');
const router = express.Router();
const historyVoucherController = require('../controllers/historyVoucherController');
const verifyToken = require('../middleware/authMiddleware'); // သင့်ရဲ့ Auth Middleware
const upload = require('../config/multer'); // 📌 Multer configuration ကို ခေါ်ယူခြင်း

// 📌 ၁။ ဘောင်ချာနှင့် ပုံသိမ်းဆည်းရန် Route (Multer ဖြင့် ပုံဖိုင်ကိုပါ တစ်ပါတည်း လက်ခံမည်)
router.post('/save', verifyToken, upload.single('image'), historyVoucherController.saveHistoryVoucher);

// 📌 ၂။ သိမ်းထားသောမှတ်တမ်းများအားလုံးကို ထုတ်ယူရန် Route (GET)
router.get('/all', verifyToken, historyVoucherController.getHistoryVouchers);

// 📌 ၃။ သက်ဆိုင်ရာ ID ဖြင့် မှတ်တမ်းကို ဖျက်ဆီးရန် Route (DELETE)
router.delete('/:id', verifyToken, historyVoucherController.deleteHistoryVoucher);

module.exports = router;