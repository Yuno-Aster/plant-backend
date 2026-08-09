const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { diagnosePlantDisease } = require('../controllers/diseaseController');

// POST: /api/disease/diagnose
router.post('/diagnose', upload.single('image'), diagnosePlantDisease);

module.exports = router;