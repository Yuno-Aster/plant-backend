const Rice = require('../models/riceModel');
const admin = require('firebase-admin'); // Firebase Admin SDK ကို ချိတ်ဆက်ရန်

// ၁။ စပါးနှင့် ဘေးထွက်ပစ္စည်း ဈေးနှုန်းများအားလုံးကို ရယူရန် (GET)
const getRices = async (req, res) => {
  try {
    const rices = await Rice.find().sort({ createdAt: -1 });
    res.status(200).json(rices);
  } catch (error) {
    res.status(500).json({ 
      message: "ဒေတာရယူရာတွင် အမှားအယွင်းရှိသည်", 
      error: error.message 
    });
  }
};

// ၂။ အချက်အလက်အသစ် ထည့်သွင်းရန် (POST + Notification)
const createRice = async (req, res) => {
  try {
    const { name, market_value, region, category } = req.body;

    const newRice = new Rice({
      name,
      market_value,
      region,
      category: category || 'rice'
    });

    const savedRice = await newRice.save();

    // 🔔 Notification ပို့ရန် Code
    try {
      const message = {
        notification: {
          title: `🌾 စပါးဈေးနှုန်း အသစ် (${savedRice.region})`,
          body: `${savedRice.name} - ${savedRice.market_value} ကျပ်`,
        },
        topic: savedRice.region, // သက်ဆိုင်ရာ ဒေသအလိုက် Topic ဖြင့် ပို့မည် (သို့မဟုတ် 'all' သုံးနိုင်သည်)
      };
      await admin.messaging().send(message);
    } catch (notifError) {
      console.log('Notification Error (Create):', notifError.message);
    }

    res.status(201).json({
      message: "စပါးအမျိုးအစား အောင်မြင်စွာ ထည့်သွင်းပြီးပါပြီ",
      data: savedRice
    });
  } catch (error) {
    res.status(500).json({ 
      message: "အမှားအယွင်း ရှိနေပါသည်", 
      error: error.message 
    });
  }
};

// ၃။ ရှိပြီးသား ဈေးနှုန်း/အချက်အလက်ကို ပြင်ဆင်ရန် (PUT + Notification)
const updateRicePrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, market_value, region, category } = req.body;

    const updatedRice = await Rice.findByIdAndUpdate(
      id,
      { name, market_value, region, category },
      { new: true, runValidators: true }
    );

    if (!updatedRice) {
      return res.status(404).json({ message: "ပြင်ဆင်ရန် အချက်အလက် ရှာမတွေ့ပါ" });
    }

    // 🔔 Notification ပို့ရန် Code (Update)
    try {
      const message = {
        notification: {
          title: `🔄 ဈေးနှုန်း ပြင်ဆင်မှု (${updatedRice.region})`,
          body: `${updatedRice.name} ဈေးနှုန်းကို ${updatedRice.market_value} ကျပ်သို့ ပြင်ဆင်လိုက်ပါပြီ`,
        },
        topic: updatedRice.region,
      };
      await admin.messaging().send(message);
    } catch (notifError) {
      console.log('Notification Error (Update):', notifError.message);
    }

    res.status(200).json({
      message: "ဈေးနှုန်း ပြင်ဆင်ပြီးပါပြီ",
      data: updatedRice
    });
  } catch (error) {
    res.status(500).json({ 
      message: "ပြင်ဆင်၍ မရပါ", 
      error: error.message 
    });
  }
};

// ၄။ အချက်အလက် ဖျက်ရန် (DELETE + Notification)
const deleteRice = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRice = await Rice.findByIdAndDelete(id);

    if (!deletedRice) {
      return res.status(404).json({ message: "ဖျက်ရန် အချက်အလက် ရှာမတွေ့ပါ" });
    }

    // 🔔 Notification ပို့ရန် Code (Delete)
    try {
      const message = {
        notification: {
          title: `🗑️ စာရင်းမှ ဖျက်သိမ်းမှု (${deletedRice.region})`,
          body: `${deletedRice.name} ကို စာရင်းမှ ဖျက်လိုက်ပါပြီ`,
        },
        topic: deletedRice.region,
      };
      await admin.messaging().send(message);
    } catch (notifError) {
      console.log('Notification Error (Delete):', notifError.message);
    }

    res.status(200).json({
      message: "အောင်မြင်စွာ ဖျက်လိုက်ပါပြီ",
      data: deletedRice
    });
  } catch (error) {
    res.status(500).json({ 
      message: "ဖျက်၍ မရပါ", 
      error: error.message 
    });
  }
};

module.exports = {
  getRices,
  createRice,
  updateRicePrice,
  deleteRice
};