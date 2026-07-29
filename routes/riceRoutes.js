const express = require('express');
const router = express.Router();
const riceController = require('../controllers/riceController');
const verifyFirebaseToken = require('../middleware/authMiddleware');

router.get('/', verifyFirebaseToken, riceController.getRices);
router.post('/', verifyFirebaseToken, riceController.createRice); // 👈 အသစ်
router.put('/:id', verifyFirebaseToken, riceController.updateRicePrice);
router.delete('/:id', verifyFirebaseToken, riceController.deleteRice); // 👈 အသစ်

module.exports = router;