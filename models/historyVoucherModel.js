const mongoose = require('mongoose');

const historyVoucherSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  itemName: { type: String, required: true, default: 'စပါး' }, // ပစ္စည်းအမည် (ဥပမာ- စပါး)
  quantity: { type: Number, required: true },     // တင်းရေ
  pricePerUnit: { type: Number, required: true },   // တစ်တင်းပေါက်ဈေး
  
  // 📌 ဖွဲ၊ ဆန်ကွဲ စသည့် ဘေးထွက်ပစ္စည်းများအတွက် Tag/Name နှင့် Amount စာရင်း
  extraIncomes: [
    {
      name: String,
      amount: Number
    }
  ],

  totalRevenue: { type: Number, required: true }, // (စပါးရောင်းရငွေ + ဘေးထွက်ပစ္စည်းအားလုံး ပေါင်း)
  
  expenses: [
    {
      name: String,
      amount: Number
    }
  ],
  totalExpenses: { type: Number, required: true },
  netProfit: { type: Number, required: true },
  date: { type: Date, required: true },
  imageUrl: { type: String },
});

module.exports = mongoose.model('HistoryVoucher', historyVoucherSchema);