const express = require('express');
const router = express.Router();
const RicePrice = require('../models/RicePrice');

// 📌 ၁။ စပါးနှင့် ဘေးထွက်ပစ္စည်း ဈေးနှုန်းများ အားလုံးကို ဖတ်ရှုရန်
router.get('/', async (req, res) => {
    try {
        const prices = await RicePrice.find().sort({ updatedAt: -1 });
        res.status(200).json({ success: true, data: prices });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 📌 ၂။ Admin မှ ဈေးနှုန်းအသစ် ထည့်ရန် သို့မဟုတ် Update လုပ်ရန် (POST)
router.post('/', async (req, res) => {
    try {
        const { name, market_value, category, region } = req.body;
        
        const targetRegion = region || 'Yangon'; 
        const targetCategory = category || 'rice';

        const updatedPrice = await RicePrice.findOneAndUpdate(
            { name: name, region: targetRegion, category: targetCategory },
            { market_value: market_value, updatedBy: 'Admin', updatedAt: Date.now() },
            { returnDocument: 'after', upsert: true }
        );

        res.status(200).json({ 
            success: true, 
            message: `Price for ${name} in ${targetRegion} updated successfully!`, 
            data: updatedPrice 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 📌 ၃။ ID ဖြင့် ရှိပြီးသား ဈေးနှုန်းကို ပြင်ဆင်ရန် (PUT - Flutter က Edit လုပ်သည့်အခါ လိုအပ်သည်)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, market_value, category, region } = req.body;

        const updatedPrice = await RicePrice.findByIdAndUpdate(
            id,
            { 
                name, 
                market_value, 
                region, 
                category, 
                updatedBy: 'Admin', 
                updatedAt: Date.now() 
            },
            { returnDocument: 'after' }
        );

        if (!updatedPrice) {
            return res.status(404).json({ success: false, message: 'Rice price item not found' });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Price updated successfully!', 
            data: updatedPrice 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 📌 ၄။ ID ဖြင့် ဖျက်ရန် (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPrice = await RicePrice.findByIdAndDelete(id);

        if (!deletedPrice) {
            return res.status(404).json({ success: false, message: 'Rice price item not found' });
        }

        res.status(200).json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;