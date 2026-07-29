const Rice = require('../models/riceModel');

// ၁။ စပါးဈေးနှုန်းအားလုံးကို ဆွဲထုတ်ရန် (GET)
exports.getRices = async (req, res) => {
  try {
    const rices = await Rice.find();
    res.status(200).json(rices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ၂။ စပါးအမျိုးအစား အသစ်ထည့်သွင်းရန် (POST)
exports.createRice = async (req, res) => {
  try {
    const { name, market_value } = req.body;
    if (!name || !market_value) {
      return res.status(400).json({ message: 'စပါးအမျိုးအစားနှင့် ဈေးနှုန်း အပြည့်အစုံ ထည့်ပါ။' });
    }

    const newRice = new Rice({ name, market_value });
    await newRice.save();

    res.status(201).json({
      message: 'စပါးအမျိုးအစား အောင်မြင်စွာ ထည့်သွင်းပြီးပါပြီ',
      data: newRice
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ၃။ စပါးဈေးနှုန်း/အမည် ပြင်ဆင်ရန် (PUT)
exports.updateRicePrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, market_value } = req.body;

    const updatedRice = await Rice.findByIdAndUpdate(
      id,
      { name, market_value },
      { new: true }
    );

    if (!updatedRice) {
      return res.status(404).json({ message: 'ရှာမတွေ့ပါ' });
    }

    res.status(200).json({
      message: 'ဈေးနှုန်း အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ',
      data: updatedRice
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ၄။ စပါးအမျိုးအစား ဖျက်ရန် (DELETE)
exports.deleteRice = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRice = await Rice.findByIdAndDelete(id);

    if (!deletedRice) {
      return res.status(404).json({ message: 'ရှာမတွေ့ပါ' });
    }

    res.status(200).json({ message: 'စပါးအမျိုးအစား အောင်မြင်စွာ ဖျက်လိုက်ပါပြီ' });
  } catch (error) {
    res.status(500).json({ message: error.message }); // 👈 ပြင်ပြီးပါပြီ
  }
};