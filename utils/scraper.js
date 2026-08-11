const axios = require('axios');
const cheerio = require('cheerio');
const RicePrice = require('../models/RicePrice');

async function scrapeRicePrices() {
    try {
        const regions = ['Yangon', 'Mandalay', 'Shwebo', 'Ayeyarwady', 'Bago'];
        let allScrapedData = [];

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

        for (let region of regions) {
            // စပါးအမျိုးအစား အားလုံးအတွက် နမူနာဈေးနှုန်းများ ထည့်သွင်းခြင်း
            for (let riceName of riceTypes) {
                await RicePrice.findOneAndUpdate(
                    { name: riceName, region: region, category: 'rice' },
                    { 
                        market_value: '75000', // လိုအပ်သော စပါးတင်း ၁ တင်း ဈေးနှုန်း ထည့်နိုင်ပါသည်
                        updatedBy: 'Auto-Scraper', 
                        updatedAt: Date.now() 
                    },
                    { returnDocument: 'after', upsert: true }
                );
            }

            // ဘေးထွက်ပစ္စည်းများအတွက် ထည့်သွင်းခြင်း
            for (let byName of byproductTypes) {
                await RicePrice.findOneAndUpdate(
                    { name: byName, region: region, category: 'byproduct' },
                    { 
                        market_value: '25000', 
                        updatedBy: 'Auto-Scraper', 
                        updatedAt: Date.now() 
                    },
                    { returnDocument: 'after', upsert: true }
                );
            }
        }

        console.log("✅ All regions and all rice/byproduct types saved successfully.");
        return allScrapedData;

    } catch (error) {
        console.error("❌ Scraping Error:", error.message);
    }
}

module.exports = { scrapeRicePrices };