const axios = require('axios');
const fs = require('fs');
const ChatSession = require('../models/ChatSession');

// ၁။ Chat လုပ်ခြင်း (History ပါ သိမ်းမည် - စပါးနှင့် စိုက်ပျိုးရေးဆိုင်ရာ သီးသန့်ကန့်သတ်ထားသည်)
exports.handleChat = async (req, res) => {
    try {
        const { message, chatId, userId } = req.body;
        const image = req.file;

        let contentParts = [{ "type": "text", "text": message || "ဒီအပင်က ဘာအပင်လဲ ပြောပြပေးပါ။" }];

        if (image) {
            const imageBuffer = fs.readFileSync(image.path);
            const base64Image = imageBuffer.toString('base64');
            contentParts.push({ "type": "image_url", "image_url": { "url": `data:image/jpeg;base64,${base64Image}` } });
        }

        // 📌 စပါးပင်နှင့် စိုက်ပျိုးရေးဆိုင်ရာ သီးသန့်ဖြစ်စေရန် သတ်မှတ်ချက်
        const systemPrompt = `You are an expert assistant strictly dedicated to rice plants, paddy farming, and agricultural practices in Myanmar. 
        - You must ONLY answer questions related to rice, paddy cultivation, diseases, fertilizers, and agricultural tips.
        - If the user asks about anything unrelated to rice or agriculture (e.g., coding, general knowledge, entertainment, politics), politely refuse in Burmese by saying: "ကျေးဇူးပြု၍ စပါးပင်နှင့် စိုက်ပျိုးရေးဆိုင်ရာ မေးခွန်းများကိုသာ မေးမြန်းပေးပါ။"
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
                $push: { messages: [{ role: 'user', content: message }, { role: 'assistant', content: aiResponse }] },
                updatedAt: Date.now()
            }, { new: true });
        } else {
            session = await ChatSession.create({
                userId: userId,
                title: message.substring(0, 20),
                messages: [{ role: 'user', content: message }, { role: 'assistant', content: aiResponse }]
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
        await ChatSession.findByIdAndDelete(req.params.id);
        res.json({ message: "Chat deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};