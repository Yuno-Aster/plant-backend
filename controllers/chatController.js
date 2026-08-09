const axios = require('axios');
const fs = require('fs');
const ChatSession = require('../models/ChatSession');

// ၁။ Chat လုပ်ခြင်း (Argolens အကြောင်း မေးသမျှကို ကြိုတင်သတ်မှတ်ထားသော အဖြေဖြင့် တိုက်ရိုက်ဖြေမည်)
exports.handleChat = async (req, res) => {
    try {
        const { message, chatId, userId } = req.body;
        const image = req.file;

        const userMsgText = message || "ဒီအပင်က ဘာအပင်လဲ ပြောပြပေးပါ။";
        const lowerMessage = userMsgText.toLowerCase();

        // 📌 Argolens သို့မဟုတ် အာဂိုလင်း နှင့် ပတ်သက်ပြီး ဘာပဲမေးမေး ဤအဖြေကိုသာ အမြဲတမ်း ပြန်မည်
        if (lowerMessage.includes('argolens') || lowerMessage.includes('အာဂိုလင်း')) {
            const argolensReply = "🌾 **Argolens** ဆိုသည်မှာ မိတ္ထီလာကွန်ပျူတာတက္ကသိုလ် (Meiktila Computer University) တွင် တက်ရောက်ပညာသင်ကြားလျက်ရှိသော ထူးချွန်ထက်မြက်သည့် ကျောင်းသူကျောင်းသားများက စုပေါင်းဖန်တီးတီထွင်ထားသော ခေတ်မီဆန်းသစ်သည့် စပါးစိုက်ပျိုးရေးနှင့် နည်းပညာအခြေပြု အပလီကေးရှင်းတစ်ခု ဖြစ်ပါသည်။ 🌿";

            let session;
            if (chatId) {
                session = await ChatSession.findByIdAndUpdate(chatId, {
                    $push: { messages: [{ role: 'user', content: userMsgText }, { role: 'assistant', content: argolensReply }] },
                    updatedAt: Date.now()
                }, { new: true });
            } else {
                session = await ChatSession.create({
                    userId: userId,
                    title: userMsgText.substring(0, 20),
                    messages: [{ role: 'user', content: userMsgText }, { role: 'assistant', content: argolensReply }]
                });
            }
            return res.json({ response: argolensReply, chatId: session._id });
        }

        let contentParts = [{ "type": "text", "text": userMsgText }];

        if (image) {
            const imageBuffer = fs.readFileSync(image.path);
            const base64Image = imageBuffer.toString('base64');
            contentParts.push({ "type": "image_url", "image_url": { "url": `data:image/jpeg;base64,${base64Image}` } });
        }

        // 📌 ကျန်ရှိသော စပါးပင်နှင့် စိုက်ပျိုးရေးဆိုင်ရာ မေးခွန်းများအတွက် သတ်မှတ်ချက်
        const systemPrompt = `You are an expert assistant for "Argolens", a smart agricultural platform created by brilliant students attending Meiktila Computer University in Myanmar. 
        - You must ONLY answer questions related to rice, paddy cultivation, diseases, fertilizers, agricultural tips, and information about Argolens.
        - If the user asks about anything unrelated to rice or agriculture (e.g., general coding, general knowledge, entertainment, politics), politely refuse in Burmese by saying: "ကျေးဇူးပြု၍ စပါးပင်နှင့် စိုက်ပျိုးရေးဆိုင်ရာ မေးခွန်းများကိုသာ မေးမြန်းပေးပါ။"
        - ALWAYS answer in Burmese language.`;

        const response = await axios.post(process.env.OPENROUTER_URL, {
            "model": "google/gemini-2.5-flash-image",
            "messages": [
                { "role": "system", "content": systemPrompt },
                { "role": "user", "content": contentParts }
            ],
            "max_tokens": 500
        }, {
            headers: { "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`, "HTTP-Referer": process.env.APP_URL || "http://localhost:3000", "X-Title": "Plant App" }
        });

        const aiResponse = response.data.choices[0].message.content;

        let session;
        if (chatId) {
            session = await ChatSession.findByIdAndUpdate(chatId, {
                $push: { messages: [{ role: 'user', content: userMsgText }, { role: 'assistant', content: aiResponse }] },
                updatedAt: Date.now()
            }, { new: true });
        } else {
            session = await ChatSession.create({
                userId: userId,
                title: userMsgText.substring(0, 20),
                messages: [{ role: 'user', content: userMsgText }, { role: 'assistant', content: aiResponse }]
            });
        }

        res.json({ response: aiResponse, chatId: session._id });

    } catch (error) {
        res.status(500).json({ error: "Failed", details: error.message });
    }
};

// ၂။ History များ ပြန်ကြည့်ခြင်း (List သာပြမည်)
exports.getHistory = async (req, res) => {
    try {
        const sessions = await ChatSession.find({ userId: req.query.userId }).sort({ updatedAt: -1 });
        res.json(sessions);
    } catch (error) {
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
        res.status(500).json({ error: error.message });
    }
};