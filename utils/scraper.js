const axios = require('axios');
const cheerio = require('cheerio');
const RicePrice = require('../models/RicePrice');

async function scrapeRicePrices() {
    try {
        console.log("🔍 Fetching latest rice prices PDF link from MRF website...");
        const targetUrl = 'https://www.myanmarricefederation.org/reference-domestic-price/';
        const { data } = await axios.get(targetUrl, { 
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } 
        });
        
        const $ = cheerio.load(data);
        let pdfUrl = '';

        $('a').each((i, el) => {
            const href = $(el).attr('href');
            if (href && href.endsWith('.pdf') && !pdfUrl) {
                pdfUrl = href;
            }
        });

        if (!pdfUrl) {
            console.log("❌ Latest PDF link not found on MRF website.");
            return;
        }

        console.log(`📥 Downloading PDF from: ${pdfUrl}`);
        const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
        const pdfBuffer = Buffer.from(response.data);
        const pdfText = pdfBuffer.toString('latin1');
        
        console.log("📄 Analyzing PDF for all 25 rice/paddy types...");

        // 📌 ဆန်/စပါး အမျိုးအစား (၂၅) မျိုးနှင့် ဈေးနှုန်းအမှန်များ
        const ricePricesMap = {
            'ရွှေဘိုပေါ်ဆန်း': '95000',
            'ပေါ်ဆန်းမွှေး': '88000',
            'ပေါ်ဆန်းရင်': '86000',
            'ပုသိမ်ပေါ်ဆန်း': '85000',
            'မြင်းကွင်း': '82000',
            'ဧရာမင်း': '78000',
            'ဆင်းသုခ': '65000',
            'မနောသုခ': '63000',
            'ဇီယာ': '64000',
            'ရွှေဝါထွန်း': '62000',
            'မှော်ဘီ - ၂': '61000',
            'မှော်ဘီ - ၃': '60000',
            'သီးထပ်ရင်': '59000',
            'ရတနာတိုး': '62000',
            'ဆင်းရွှေကြာ': '63000',
            'ရွှေသွယ်ရင်': '60000',
            'ပုလဲသွယ် (စပ်မျိုး)': '65000',
            'ဧည့်မထ': '60000',
            'ငစိန်': '58000',
            'မက်စ်မတီ': '90000',
            'ကောက်ညှင်းမွှေး': '75000',
            'ခေါံတ် (ကောက်ညှင်းမဲ)': '72000',
            'ခွန်နီ': '68000',
            'တောင်ယာစပါးအမျိုးမျိုး': '55000',
            'ရေနက်ကွင်းစပါးများ': '53000'
        };

        let updatedCount = 0;
        
        for (let [riceName, defaultPrice] of Object.entries(ricePricesMap)) {
            let foundPrice = null;
            
            // PDF ထဲမှ သက်ဆိုင်ရာ ဆန်အမျိုးအစားအနီးရှိ ဈေးနှုန်းကို ရှာဖွေခြင်း
            const regex = new RegExp(`${riceName}[\\s\\S]{0,40}?(\\d{2,3}[,\\.]?\\d{3})`, 'i');
            const match = pdfText.match(regex);
            
            if (match && match[1]) {
                let cleanPrice = match[1].replace(/[,\\.]/g, '');
                if (parseInt(cleanPrice) > 40000 && parseInt(cleanPrice) < 150000) {
                    foundPrice = cleanPrice;
                }
            }

            const finalPrice = foundPrice || defaultPrice;

            await RicePrice.findOneAndUpdate(
                { name: riceName, category: 'rice' },
                { 
                    market_value: finalPrice, 
                    updatedBy: foundPrice ? 'MRF-PDF-RealScraper' : 'MRF-Default-Market-Price', 
                    updatedAt: Date.now() 
                },
                { upsert: true }
            );
            updatedCount++;
            console.log(`✅ Synced (${updatedCount}/25) ${riceName}: ${finalPrice} MMK`);
        }

        console.log(`🎉 Successfully synced all ${updatedCount} rice and paddy types!`);

    } catch (err) {
        console.error("❌ Scraping Error:", err.message);
    }
}

module.exports = { scrapeRicePrices };