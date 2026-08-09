const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// 1. Mongoose Schema & Model ဖန်တီးခြင်း
const riceSuggestionSchema = new mongoose.Schema({
  variety_name: { type: String, required: true },
  user_email: { type: String, default: 'Guest' },
  user_id: { type: String, default: 'Anonymous' },
  createdAt: { type: Date, default: Date.now }
});

const RiceSuggestion = mongoose.model('RiceSuggestion', riceSuggestionSchema);

// 2. User ဘက်မှ ရှာမတွေ့သော စပါးအမည် ပို့လာပါက သိမ်းဆည်းရန် (POST /api/rice-suggestions)
router.post('/rice-suggestions', async (req, res) => {
  try {
    const { variety_name } = req.body;
    
    if (!variety_name || variety_name.trim() === '') {
      return res.status(400).json({ error: 'Variety name is required' });
    }

    const newSuggestion = new RiceSuggestion({
      variety_name: variety_name.trim(),
      // အကယ်၍ auth middleware သုံးထားပါက req.user မှတဆင့် ယူနိုင်သည်
      user_email: req.user?.email || 'Guest',
      user_id: req.user?.uid || 'Anonymous'
    });

    await newSuggestion.save();
    res.status(201).json({ 
      success: true, 
      message: 'Suggestion saved successfully', 
      data: newSuggestion 
    });
  } catch (error) {
    console.error('Error saving suggestion:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Admin ဘက်မှ အကြံပြုချက်စာရင်းများကို ဝင်ရောက်ကြည့်ရှုရန် (GET /api/rice-suggestions)
router.get('/rice-suggestions', async (req, res) => {
  try {
    // အသစ်ဆုံးကို အပေါ်ဆုံးတင်၍ ဆွဲထုတ်မည်
    const suggestions = await RiceSuggestion.find().sort({ createdAt: -1 });
    res.status(200).json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Admin ဘက်မှ စစ်ဆေးပြီးသား/မလိုအပ်တော့သည့် အကြံပြုချက်ကို ဖျက်ဆီးရန် (DELETE /api/rice-suggestions/:id)
router.delete('/rice-suggestions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedSuggestion = await RiceSuggestion.findByIdAndDelete(id);
    
    if (!deletedSuggestion) {
      return res.status(404).json({ success: false, error: 'Suggestion not found' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Suggestion deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting suggestion:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;