const Rice = require('../models/riceModel');
const admin = require('../config/firebaseAdmin');

// 📌 စပါးဈေးနှုန်းအားလုံး ဆွဲထုတ်ရန် (သို့မဟုတ် Region အလိုက် Filter လုပ်ရန်)
exports.getRices = async (req, res) => {
  try {
    const { region } = req.query; // ဥပမာ - /api/rices?region=Ayeyarwady
    let query = {};
    if (region && region.trim() !== '') {
      query.region = region.trim();
    }
    const rices = await Rice.find(query).sort({ createdAt: -1 });
    res.status(200).json(rices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 စပါးအမျိုးအစား အသစ်ထည့်သွင်းရန် (POST)
exports.createRice = async (req, res) => {
  try {
    const { name, market_value, region } = req.body;
    
    if (!name || !market_value || !region) {
      return res.status(400).json({ message: 'စပါးအမျိုးအစား၊ ဈေးနှုန်းနှင့် ဒေသ အပြည့်အစုံ ထည့်ပါ။' });
    }

    const newRice = new Rice({ 
      name: name.trim(), 
      market_value: market_value.trim(), 
      region: region.trim() 
    });
    
    await newRice.save();

    // 🔔 Notification တွင် ဒေသအမည်ပါ ထည့်သွင်းခြင်း
    const message = {
      notification: {
        title: `🌾 စပါးဈေးနှုန်း အသစ် (${region.trim()})`,
        body: `${name.trim()} - ${market_value.trim()} ကျပ်`,
      },
      topic: 'rice_updates',
    };

    try {
      await admin.messaging().send(message);
    } catch (fcmError) {
      console.error('Notification Error:', fcmError);
    }

    res.status(201).json({
      message: 'စပါးအမျိုးအစား အောင်မြင်စွာ ထည့်သွင်းပြီးပါပြီ',
      data: newRice
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 စပါးဈေးနှုန်း ပြင်ဆင်ရန် (PUT)
exports.updateRicePrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, market_value, region } = req.body;

    // 📌 ပေးပို့လာသော တန်ဖိုးများကို စစ်ဆေးပြီးမှ update လုပ်ရန် (Dynamic Update)
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (market_value) updateData.market_value = market_value.trim();
    if (region) updateData.region = region.trim();

    const updatedRice = await Rice.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedRice) {
      return res.status(404).json({ message: 'ရှာမတွေ့ပါ' });
    }

    const message = {
      notification: {
        title: `🔄 စပါးဈေးနှုန်း ပြင်ဆင်ချက် (${updatedRice.region})`,
        body: `${updatedRice.name} - ${updatedRice.market_value} ကျပ်`,
      },
      topic: 'rice_updates',
    };

    try {
      await admin.messaging().send(message);
    } catch (fcmError) {
      console.error('Notification Error:', fcmError);
    }

    res.status(200).json({
      message: 'ဈေးနှုန်း အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ',
      data: updatedRice
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 စပါးအမျိုးအစား ဖျက်ရန် (DELETE)
exports.deleteRice = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRice = await Rice.findByIdAndDelete(id);

    if (!deletedRice) {
      return res.status(404).json({ message: 'ရှာမတွေ့ပါ' });
    }

    res.status(200).json({ message: 'စပါးအမျိုးအစား အောင်မြင်စွာ ဖျက်လိုက်ပါပြီ' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};