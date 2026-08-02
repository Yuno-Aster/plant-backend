const fs = require('fs');
const path = require('path');
const HistoryVoucher = require('../models/historyVoucherModel');

// 📌 ၁။ ဘောင်ချာနှင့် ပုံကို သိမ်းဆည်းရန်
exports.saveHistoryVoucher = async (req, res) => {
  try {
    const { userId, baskets, pricePerBasket, totalRevenue, expenses, totalExpenses, netProfit, date, imageBase64 } = req.body;

    let imageUrl = '';

    // ပုံပါလာပါက Server ပေါ်သို့ ပုံဖိုင်အဖြစ် သိမ်းမည်
    if (imageBase64) {
      const base64Data = imageBase64.replace(/^data:image\/png;base64,/, "");
      const filename = `history_voucher_${userId}_${Date.now()}.png`;
      const uploadDir = path.join(__dirname, '../public/uploads');

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, base64Data, 'base64');

      imageUrl = `/uploads/${filename}`;
    }

    // Database ထဲသို့ အချက်အလက်များ သိမ်းဆည်းခြင်း
    const newVoucher = new HistoryVoucher({
      userId,
      baskets,
      pricePerBasket,
      totalRevenue,
      expenses,
      totalExpenses,
      netProfit,
      date,
      imageUrl,
    });

    await newVoucher.save();

    res.status(201).json({
      success: true,
      message: 'History Voucher and Image saved successfully!',
      voucher: newVoucher,
    });

  } catch (error) {
    console.error("Save History Voucher Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 📌 ၂။ သုံးစွဲသူအလိုက် သိမ်းထားသော History များကို ပြန်လည်ထုတ်ပေးရန်
exports.getHistoryVouchers = async (req, res) => {
  try {
    const userId = req.user.uid;
    const vouchers = await HistoryVoucher.find({ userId }).sort({ date: -1 }); // အသစ်ဆုံးကို အပေါ်ဆုံးတင်ရန်

    res.status(200).json({
      success: true,
      vouchers,
    });
  } catch (error) {
    console.error("Get History Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 📌 ၃။ သက်ဆိုင်ရာ History ID ဖြင့် Database နှင့် Server ပေါ်ရှိ ပုံပါ ဖျက်ဆီးရန်
exports.deleteHistoryVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const voucher = await HistoryVoucher.findOne({ _id: id, userId });
    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found' });
    }

    // Server ပေါ်တွင် သိမ်းထားသော ပုံဖိုင်ရှိပါကပါ တစ်ပါတည်း ဖျက်မည်
    if (voucher.imageUrl) {
      const filePath = path.join(__dirname, '../public', voucher.imageUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await HistoryVoucher.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Voucher deleted successfully!',
    });
  } catch (error) {
    console.error("Delete History Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};