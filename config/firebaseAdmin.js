const admin = require('firebase-admin');

let serviceAccount;

// Render ပေါ်မှာဆိုရင် Environment Variable ကနေဖတ်မယ်၊ 
// ကိုယ့်စက် (Local) မှာဆိုရင် ဖိုင်ကနေ ယူသုံးမယ်
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  serviceAccount = require('./firebase-service-account.json');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

console.log("✅ Firebase Initialized successfully!");

module.exports = admin;