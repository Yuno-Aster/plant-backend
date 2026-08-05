const express = require('express');
const router = express.Router();
const riceController = require('../controllers/riceController');

// 👇 ဤနေရာတွင် verifyFirebaseToken ကို ပြန်လည် ထည့်သွင်းပေးပါ (Uncomment လုပ်ပါ)
const verifyFirebaseToken = require('../middleware/authMiddleware');

// ဈေးနှုန်းကြည့်ရန် (Login လုံးဝမလိုပါ)
router.get('/', riceController.getRices);

// အသစ်ထည့်ရန်၊ ပြင်ရန်၊ ဖျက်ရန် (Login/Token လိုအပ်သည်)
router.post('/', verifyFirebaseToken, riceController.createRice); 
router.put('/:id', verifyFirebaseToken, riceController.updateRicePrice);
router.delete('/:id', verifyFirebaseToken, riceController.deleteRice);

module.exports = router;