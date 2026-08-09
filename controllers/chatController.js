const axios = require('axios');
const fs = require('fs');
const ChatSession = require('../models/ChatSession');

// ၁။ Chat လုပ်ခြင်း (စာသားရော ပုံပါ ပို့၍ စစ်ဆေးခြင်းနှင့် Error အသေးစိတ်ဖော်ပြခြင်း)
exports.handleChat = async (req, res) => {
    try {
        const { message, chatId, userId } = req.body;
        const image = req.file;

        const userMsgText = message || "ဒီအပင်က ဘာအပင်လဲ ပြောပြပေးပါ။";
        const lowerMessage = userMsgText.toLowerCase();

        // 📌 Argolens သို့မဟုတ် အာဂိုလင်း နှင့် ပတ်သက်ပြီး ဘာပဲမေးမေး ဤအဖြေကိုသာ အမြဲတမ်း ပြန်မည်
        if (lowerMessage.includes('argolens') || lowerMessage.includes('အာဂိုလင်း')) {
            const argolensReply = "🌾 **Argolens** ဆိုသည်မှာ မိတ္ထီလာကွန်ပျူတာတက္ကသိုလ် (Meiktila Computer University) တွင် တက်ရောက်ပညာသင်ကြားလျက်ရှိသော ကျောင်းသူကျောင်းသားများက စုပေါင်းဖန်တီးတီထွင်ထားသော ခေတ်မီဆန်းသစ်သည့် စပါးစိုက်ပျိုးရေးနှင့် နည်းပညာအခြေပြု အပလီကေးရှင်းတစ်ခု ဖြစ်ပါသည်။ 🌿";

            let session;
            if (chatId) {
                session = await ChatSession.findByIdAndUpdate(chatId, {
                    $push: { messages: [{ role: 'user', content: userMsgText }, { role: 'assistant', content: argolensReply }] },
                    updatedAt: Date.now()
                }, { new: true });
            } else {
                session = await ChatSession.create({
                    userId: userId || "guest_user",
                    title: userMsgText.substring(0, 20),
                    messages: [{ role: 'user', content: userMsgText }, { role: 'assistant', content: argolensReply }]
                });
            }
            return res.json({ response: argolensReply, chatId: session._id });
        }

        // 📌 AI မော်ဒယ်တိုင်း စည်းမျဉ်းကို တိတိကျကျလိုက်နာစေရန် User မက်ဆေ့စ်ထဲသို့ ညွှန်ကြားချက် ထည့်သွင်းခြင်း
        const enforcedUserText = `[စည်းမျဉ်း - သင်သည် မိတ္ထီလာကွန်ပျူတာတက္ကသိုလ် ကျောင်းသားများဖန်တီးထားသော "Argolens" စပါးစိုက်ပျိုးရေးပလက်ဖောင်း၏ AI လက်ထောက်ဖြစ်သည်။ စပါးပင်၊ စိုက်ပျိုးရေး၊ မြေသြဇာနှင့် ရောဂါများအကြောင်းကိုသာ မြန်မာဘာသာဖြင့် တိကျစွာဖြေပါ။ စပါးနှင့်မဆိုင်သည်များကို မေးလျှင် "ကျေးဇူးပြု၍ စပါးပင်နှင့် စိုက်ပျိုးရေးဆိုင်ရာ မေးခွန်းများကိုသာ မေးမြန်းပေးပါ။" ဟု မြန်မာလိုသာ တိတိကျကျ ဖြေပါ။ အခြားဘာသာစကား လုံးဝမသုံးရပါ။]

မေးခွန်း: ${userMsgText}`;

        let contentParts = [{ "type": "text", "text": enforcedUserText }];

        // 🖼 ပုံပါလာပါက Base64 သို့ ပြောင်း၍ ထည့်သွင်းခြင်း
        if (image) {
            try {
                const imageBuffer = fs.readFileSync(image.path);
                const base64Image = imageBuffer.toString('base64');
                contentParts.push({ 
                    "type": "image_url", 
                    "image_url": { "url": `data:image/jpeg;base64,${base64Image}` } 
                });
            } catch (imgError) {
                console.error("❌ Image processing error:", imgError.message);
            }
        }

        console.log("🤖 OpenRouter သို့ AI တောင်းဆိုမှု ပို့နေပါပြီ...");

        const response = await axios.post(process.env.OPENROUTER_URL, {
            "model": "openrouter/free", // 👈 404 Error လုံးဝမတက်တော့မည့် အလိုအလျောက် ရွေးချယ်ပေးသော Free Router
            "messages": [
                { "role": "user", "content": contentParts }
            ],
            "max_tokens": 500
        }, {
            headers: { 
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`, 
                "HTTP-Referer": process.env.APP_URL || "http://localhost:3000", 
                "X-Title": "Plant App" 
            }
        });

        const aiResponse = response.data.choices[0].message.content;
        console.log("✅ AI အဖြေ အောင်မြင်စွာ ရရှိပါပြီ။");

        let session;
        if (chatId) {
            session = await ChatSession.findByIdAndUpdate(chatId, {
                $push: { messages: [{ role: 'user', content: userMsgText }, { role: 'assistant', content: aiResponse }] },
                updatedAt: Date.now()
            }, { new: true });
        } else {
            session = await ChatSession.create({
                userId: userId || "guest_user",
                title: userMsgText.substring(0, 20),
                messages: [{ role: 'user', content: userMsgText }, { role: 'assistant', content: aiResponse }]
            });
        }

        res.json({ response: aiResponse, chatId: session._id });

    } catch (error) { 
        console.error("❌ OPENROUTER / CHAT ERROR DETECTED:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Message:", error.message);
        }

        res.status(500).json({ 
            error: "Failed to process chat", 
            details: error.response ? error.response.data : error.message 
        });
    }
};

// ၂။ History များ ပြန်ကြည့်ခြင်း (List သာပြမည်)
exports.getHistory = async (req, res) => {
    try {
        const sessions = await ChatSession.find({ userId: req.query.userId }).sort({ updatedAt: -1 });
        res.json(sessions);
    } catch (error) {
        console.error("❌ Get History Error:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// ၃။ Chat တစ်ခုချင်းစီရဲ့ Messages များကို Fetch လုပ်ခြင်း
exports.getChatMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const chat = await ChatSession.findById(chatId);
        
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }
        
        res.json({ messages: chat.messages });
    } catch (error) {
        console.error("❌ Get Chat Messages Error:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// ၄။ Chat တစ်ခုကို ဖျက်ခြင်း
exports.deleteChat = async (req, res) => {
    try {
        const { id } = req.params;
        await ChatSession.findByIdAndDelete(id);
        res.json({ message: "Chat deleted successfully" });
    } catch (error) {
        console.error("❌ Delete Chat Error:", error.message);
        res.status(500).json({ error: error.message });
    }
};