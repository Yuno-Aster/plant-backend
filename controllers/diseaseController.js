const axios = require('axios');

const diagnosePlantDisease = async (req, res) => {
  try {
    console.log("📥 Server ဆီသို့ အပင်ပုံ ရောက်ရှိလာပါပြီ!");

    if (!req.file) {
      console.log("❌ ပုံဖိုင် (Image File) ပါမလာပါ။");
      return res.status(400).json({ 
        success: false, 
        message: "ကျေးဇူးပြု၍ စစ်ဆေးလိုသော အပင်ပုံကို တင်ပေးပါ။" 
      });
    }

    // 📌 MimeType က application/octet-stream ဖြစ်နေပါက image/jpeg သို့ ပြောင်းပေးရန်
    let mimeType = req.file.mimetype;
    if (!mimeType || mimeType === 'application/octet-stream') {
      mimeType = 'image/jpeg';
    }

    console.log("📁 လက်ခံရရှိသော ပုံအမျိုးအစား (Fixed MimeType):", mimeType);
    console.log("📦 ပုံ ဆိုဒ် (Size in bytes):", req.file.buffer.length);

    const base64Image = req.file.buffer.toString("base64");

    const promptText = `
    သင်သည် စိုက်ပျိုးရေးနှင့် အပင်ရောဂါ ကျွမ်းကျင်ပညာရှင်တစ်ဦး ဖြစ်ပါသည်။ ဤပေးထားသော အပင်/စပါးပင်ပုံကို သေချာစွာ စစ်ဆေးပေးပါ။
    
    အောက်ပါအချက်များကို မြန်မာဘာသာဖြင့် တိကျရှင်းလင်းစွာ ဖြေကြားပေးပါ:
    ၁။ **ရောဂါအခြေအနေ:** ပုံထဲပါ အပင်တွင် ရောဂါ သို့မဟုတ် ပိုးမွှားကျရောက်မှု ရှိ/မရှိ ရှင်းလင်းပါ။ (ရှိလျှင် ရောဂါအမည်ကို ဖော်ပြပါ)
    ၂။ **ပြုစုကုသရန် နည်းလမ်းများ:** အပင်ကို ဘယ်လိုပြုစုစောင့်ရှောက်ရမည်နည်း။
    ၃။ **သုံးသင့်သော ဆေးဝါးများနှင့် ကာကွယ်ပုံ:** မည်သည့်ဆေးဝါးများကို မည်သို့အသုံးပြုရမည်နည်း။ (အကယ်၍ ရောဂါမရှိဘဲ ကျန်းမာနေပါက နောင်တွင်လည်း ဆက်လက်ထိန်းသိမ်းရန် နည်းလမ်းများကို ဖြေကြားပေးပါ)
    `;

    const contentParts = [
      { "type": "text", "text": promptText },
      { 
        "type": "image_url", 
        "image_url": { 
          // 📌 ပြင်ဆင်ထားသော mimeType ကို အသုံးပြုခြင်း
          "url": `data:${mimeType};base64,${base64Image}` 
        } 
      }
    ];

    console.log("🤖 OpenRouter (Gemini) ဆီသို့ ပုံနှင့် မက်ဆေ့ချ် ပို့နေပါပြီ...");

    const response = await axios.post(process.env.OPENROUTER_URL, {
      "model": "google/gemini-2.5-flash-image",
      "messages": [
        { 
          "role": "user", 
          "content": contentParts 
        }
      ],
      "max_tokens": 1000
    }, {
      headers: { 
        "Authorization": `Bearer ${process.env.OPEN_ROUTER_API_KEY || process.env.OPENROUTER_API_KEY}`, 
        "HTTP-Referer": process.env.APP_URL || "http://localhost:3000", 
        "X-Title": "Plant App" 
      }
    });

    console.log("✅ OpenRouter ထံမှ အဖြေ အောင်မြင်စွာ လက်ခံရရှိပါပြီ!");
    const diagnosisText = response.data.choices[0].message.content;

    return res.status(200).json({
      success: true,
      diagnosis: diagnosisText,
    });

  } catch (error) {
    console.error("❌ Error ဖြစ်သွားပါသည်: ", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "ရောဂါရှာဖွေရာတွင် အမှားအယွင်း ရှိသွားပါသည်။",
      error: error.response?.data || error.message,
    });
  }
};

module.exports = {
  diagnosePlantDisease,
};