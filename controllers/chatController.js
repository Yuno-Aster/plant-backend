const Groq = require('groq-sdk');
const ChatSession = require('../models/ChatSession');

// ၁။ Chat လုပ်ခြင်း (Groq API ဖြင့် မြန်မာလို အမှားအယွင်းမရှိ အမြန်ဆုံးဖြေဆိုခြင်း)
exports.handleChat = async (req, res) => {
    try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const { message, chatId, userId } = req.body;
        const userMsgText = message || "ဒီအပင်က ဘာအပင်လဲ ပြောပြပေးပါ။";
        const lowerMessage = userMsgText.toLowerCase();

        // 📌 Argolens သို့မဟုတ် အာဂိုလင်း နှင့် ပတ်သက်ပြီး ဘာပဲမေးမေး ဤအဖြေကိုသာ အမြဲတမ်း မြန်မာလို ပြန်မည်
        if (lowerMessage.includes('argolens') || lowerMessage.includes('အာဂိုလင်း')) {
            const argolensReply = "🌾 **Argolens** ဆိုသည်မှာ မိတ္ထီလာကွန်ပျူတာတက္កသိုလ် (Meiktila Computer University) တွင် တက်ရောက်ပညာသင်ကြားလျက်ရှိသော ကျောင်းသူကျောင်းသားများက စုပေါင်းဖန်တီးတီထွင်ထားသော ခေတ်မီဆန်းသစ်သည့် စပါးစိုက်ပျိုးရေးနှင့် နည်းပညာအခြေပြု အပလီကေးရှင်းတစ်ခု ဖြစ်ပါသည်။ 🌿";

            let session;
            if (chatId) {
                session = await ChatSession.findByIdAndUpdate(chatId, {
                    $push: { messages: [{ role: 'user', content: userMsgText }, { role: 'assistant', content: argolensReply }] },
                    updatedAt: Date.now()
                }, { returnDocument: 'after' });
            } else {
                session = await ChatSession.create({
                    userId: userId || "guest_user",
                    title: userMsgText.substring(0, 20),
                    messages: [{ role: 'user', content: userMsgText }, { role: 'assistant', content: argolensReply }]
                });
            }
            return res.json({ response: argolensReply, chatId: session._id });
        }

        console.log("🤖 Groq AI သို့ တောင်းဆိုမှု ပို့နေပါပြီ...");

        // 📌 Groq Llama မော်ဒယ်ဖြင့် မြန်မာလို တိကျစွာ မေးမြန်းခြင်း
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: "You are an expert agricultural assistant for 'Argolens', a smart agricultural platform created by students of Meiktila Computer University in Myanmar. You MUST answer all questions exclusively in the Burmese language (မြန်မာဘာသာ). Do not use English in your final response. Focus strictly on rice, paddy cultivation, crop diseases, fertilizers, and agricultural tips."
                },
                {
                    role: "user",
                    content: userMsgText
                }
            ],
            temperature: 0.7,
            max_tokens: 1024,
        });

        const aiResponse = completion.choices[0]?.message?.content || "အဖြေထုတ်ပေးရန် အခက်အခဲရှိနေပါသည်။";

        console.log("✅ AI မြန်မာလိုအဖြေ အောင်မြင်စွာ ရရှိပါပြီ။");

        let session;
        if (chatId) {
            session = await ChatSession.findByIdAndUpdate(chatId, {
                $push: { messages: [{ role: 'user', content: userMsgText }, { role: 'assistant', content: aiResponse }] },
                updatedAt: Date.now()
            }, { returnDocument: 'after' });
        } else {
            session = await ChatSession.create({
                userId: userId || "guest_user",
                title: userMsgText.substring(0, 20),
                messages: [{ role: 'user', content: userMsgText }, { role: 'assistant', content: aiResponse }]
            });
        }

        res.json({ response: aiResponse, chatId: session._id });

    } catch (error) { 
        console.error("❌ GROQ API / CHAT ERROR DETECTED:", error);
        res.status(500).json({ 
            error: "Failed to process chat", 
            details: error.message 
        });
    }
};

// ၂။ History များ ပြန်ကြည့်ခြင်း
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