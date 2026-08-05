const express = require('express');
const router = express.Router();
const riceController = require('../controllers/riceController');
// const verifyFirebaseToken = require('../middleware/authMiddleware'); // ❌ မလိုတော့၍ ပိတ်ထားနိုင်သည် (သို့မဟုတ် ဖျက်နိုင်သည်)

// ✅ Login (Token) စစ်ဆေးခြင်းမရှိဘဲ တိုက်ရိုက်ကြည့်နိုင်ရန် ပြင်ဆင်ထားခြင်း
router.get('/', riceController.getRices);
router.post('/', verifyFirebaseToken, riceController.createRice); // 👈 တင်သွင်း/ဖန်တီးခြင်းကိုမူ Admin/Login လိုချင်ပါက verifyFirebaseToken ထားနိုင်သည် (သို့မဟုတ် ဖြုတ်လိုက ဖြုတ်နိုင်သည်)
router.put('/:id', verifyFirebaseToken, riceController.updateRicePrice);
router.delete('/:id', verifyFirebaseToken, riceController.deleteRice);

module.exports = router;