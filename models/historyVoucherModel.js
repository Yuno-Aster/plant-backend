const mongoose = require('mongoose');

const historyVoucherSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  baskets: { type: Number, required: true },
  pricePerBasket: { type: Number, required: true },
  totalRevenue: { type: Number, required: true },
  expenses: [
    {
      name: String,
      amount: Number
    }
  ],
  totalExpenses: { type: Number, required: true },
  netProfit: { type: Number, required: true },
  date: { type: Date, required: true },
  imageUrl: { type: String }, // သိမ်းဆည်းထားသော ပုံလမ်းကြောင်း
});

module.exports = mongoose.model('HistoryVoucher', historyVoucherSchema);