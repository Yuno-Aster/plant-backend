const RicePrice = require('../models/RicePrice');

async function scrapeRicePrices() {
    try {
        console.log("🔍 Initializing Rice Price Database Sync...");

        // 📌 Flutter ဘက်က သတ်မှတ်ထားသော စပါးအမျိုးအစား (၂၅) မျိုး စာရင်း
        const riceTypes = [
            'ရွှေဘိုပေါ်ဆန်း', 'ပေါ်ဆန်းမွှေး', 'ပေါ်ဆန်းရင်', 'ပုသိမ်ပေါ်ဆန်း', 'မြင်းကွင်း',
            'ဧရာမင်း', 'ဆင်းသုခ', 'မနောသုခ', 'ဇီယာ', 'ရွှေဝါထွန်း',
            'မှော်ဘီ - ၂', 'မှော်ဘီ - ၃', 'သီးထပ်ရင်', 'ရတနာတိုး', 'ဆင်းရွှေကြာ',
            'ရွှေသွယ်ရင်', 'ပုလဲသွယ် (စပ်မျိုး)', 'ဧည့်မထ', 'ငစိန်', 'မက်စ်မတီ',
            'ကောက်ညှင်းမွှေး', 'ခေါံတ် (ကောက်ညှင်းမဲ)', 'ခွန်နီ', 'တောင်ယာစပါးအမျိုးမျိုး', 'ရေနက်ကွင်းစပါးများ'
        ];

        // 📌 ဖွဲနှင့် ကောက်ရိုး အမျိုးအစားများ
        const byproductTypes = [
            'ဖွဲနု', 'ဖွဲကြမ်း', 'ကောက်ရိုးအထုံး', 'ကောက်ရိုးစင်းပြီးသား'
        ];

        const regions = ['Yangon', 'Mandalay', 'Shwebo', 'Ayeyarwady', 'Bago'];
        let updatedCount = 0;

        for (let region of regions) {
            // စပါးအမျိုးအစားများအတွက် ထည့်သွင်းခြင်း
            for (let riceName of riceTypes) {
                await RicePrice.findOneAndUpdate(
                    { name: riceName, region: region, category: 'rice' },
                    { 
                        market_value: '85000', 
                        updatedBy: 'Auto-Sync', 
                        updatedAt: Date.now() 
                    },
                    { returnDocument: 'after', upsert: true }
                );
                updatedCount++;
            }

            // ဘေးထွက်ပစ္စည်းများအတွက် ထည့်သွင်းခြင်း
            for (let byName of byproductTypes) {
                await RicePrice.findOneAndUpdate(
                    { name: byName, region: region, category: 'byproduct' },
                    { 
                        market_value: '28000', 
                        updatedBy: 'Auto-Sync', 
                        updatedAt: Date.now() 
                    },
                    { returnDocument: 'after', upsert: true }
                );
                updatedCount++;
            }
        }

        console.log(`✅ Successfully synced ${updatedCount} rice and byproduct items to Database!`);

    } catch (error) {
        console.error("❌ Scraping & Sync Error:", error.message);
    }
}

module.exports = { scrapeRicePrices };