const express = require('express');
const router = express.Router();
const riceController = require('../controllers/riceController');
const verifyFirebaseToken = require('../middleware/authMiddleware');

// ဈေးနှုန်းများ အားလုံးကို ရယူရန် (Login / Token မလိုအပ်ပါ)
router.get('/', riceController.getRices);

// ဈေးနှုန်းအသစ် ထည့်သွင်းရန် (Login / Token လိုအပ်သည်)
router.post('/', verifyFirebaseToken, riceController.createRice); 

// ရှိပြီးသား ဈေးနှုန်းကို ပြင်ဆင်ရန် (Login / Token လိုအပ်သည်)
router.put('/:id', verifyFirebaseToken, riceController.updateRicePrice);

// ဈေးနှုန်း အချက်အလက် ဖျက်ရန် (Login / Token လိုအပ်သည်)
router.delete('/:id', verifyFirebaseToken, riceController.deleteRice);

module.exports = router;