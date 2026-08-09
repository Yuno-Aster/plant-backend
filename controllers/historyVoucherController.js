const fs = require('fs');
const path = require('path');
const HistoryVoucher = require('../models/historyVoucherModel');

// 📌 ၁။ ဘောင်ချာနှင့် ပုံကို သိမ်းဆည်းရန် (Multer Memory Storage ဖြင့်)
exports.saveHistoryVoucher = async (req, res) => {
  try {
    const userId = req.user.uid; // Middleware (`verifyToken`) မှ ရယူထားသော User ID

    const { 
      itemName,      // ဥပမာ - 'စပါး'
      quantity,      // စပါးတင်းရေ
      pricePerUnit,  // တစ်တင်းပေါက်ဈေး
      extraIncomes,  // 📌 ဘေးထွက်ပစ္စည်းများ (FormData မှ string အဖြစ်လာနိုင်သည်)
      totalRevenue, 
      expenses,      // (FormData မှ string အဖြစ်လာနိုင်သည်)
      totalExpenses, 
      netProfit, 
      date 
    } = req.body;

    let imageUrl = '';

    // 📌 Multer မှတစ်ဆင့် ပုံပါလာပါက Server ပေါ်သို့ ဖိုင်အဖြစ် သိမ်းမည်
    if (req.file) {
      const filename = `history_voucher_${userId}_${Date.now()}.png`;
      const uploadDir = path.join(__dirname, '../public/uploads');

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, req.file.buffer); // req.file.buffer ကို အသုံးပြု၍ ဖိုင်ရေးမည်

      imageUrl = `/uploads/${filename}`;
    }

    // 📌 FormData မှလာသော Array ဒေတာများကို JSON အဖြစ်သို့ ဘာသာပြန်ခြင်း
    let parsedExtraIncomes = [];
    if (extraIncomes) {
      try {
        parsedExtraIncomes = typeof extraIncomes === 'string' ? JSON.parse(extraIncomes) : extraIncomes;
      } catch (e) {
        parsedExtraIncomes = [];
      }
    }

    let parsedExpenses = [];
    if (expenses) {
      try {
        parsedExpenses = typeof expenses === 'string' ? JSON.parse(expenses) : expenses;
      } catch (e) {
        parsedExpenses = [];
      }
    }

    // Database ထဲသို့ အချက်အလက်များ သိမ်းဆည်းခြင်း
    const newVoucher = new HistoryVoucher({
      userId,
      itemName: itemName || 'စပါး',
      quantity,
      pricePerUnit,
      extraIncomes: parsedExtraIncomes, 
      totalRevenue,
      expenses: parsedExpenses,
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
    const vouchers = await HistoryVoucher.find({ userId }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      vouchers,
    });
  } catch (error) {
    console.error("Get History Error:", error);
    res.status(500).json({ success: error.message });
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