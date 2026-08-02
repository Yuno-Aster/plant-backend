// const admin = require('firebase-admin');

// let serviceAccount;

// // Render ပေါ်မှာဆိုရင် Environment Variable ကနေဖတ်မယ်၊ 
// // ကိုယ့်စက် (Local) မှာဆိုရင် ဖိုင်ကနေ ယူသုံးမယ်
// if (process.env.FIREBASE_SERVICE_ACCOUNT) {
//   serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
// } else {
//   serviceAccount = require('./firebase-service-account.json');
// }

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// console.log("✅ Firebase Initialized successfully!");

// module.exports = admin;

const admin = require('firebase-admin');
const path = require('path');

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    // 🌐 Render (Production) အတွက် Environment Variable မှ ယူခြင်း
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    
    // Render တွင် private_key ထဲရှိ \n (Newlines) တွေ ပျက်စီးတတ်ခြင်းကို ကာကွယ်ရန်
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
  } catch (error) {
    console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable:", error.message);
    process.exit(1);
  }
} else {
  try {
    // 💻 Local (ကိုယ့်စက်) အတွက် backend ဖိုင်တွဲထဲရှိ json ဖိုင်ကို path ဖြင့် တိကျစွာခေါ်ရန်
    const filePath = path.join(__dirname, '..', 'firebase-service-account.json');
    serviceAccount = require(filePath);
  } catch (error) {
    console.error("❌ firebase-service-account.json file not found in backend folder!", error.message);
    process.exit(1);
  }
}

// Firebase ကို တစ်ကြိမ်ထက်ပိုပြီး Initialize လုပ်မိခြင်း (Duplicate App Error) မှ ကာကွယ်ရန်
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log("✅ Firebase Initialized successfully!");
}

module.exports = admin;