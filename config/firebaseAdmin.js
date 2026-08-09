const path = require('path');
const admin = require('firebase-admin');

// admin က undefined ဖြစ်နေလျှင် ချက်ချင်း အကြောင်းကြားရန်
if (!admin) {
  console.error("❌ 'firebase-admin' package is undefined! Please run 'npm install firebase-admin'");
  process.exit(1);
}

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
  } catch (error) {
    console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable:", error.message);
    process.exit(1);
  }
} else {
  try {
    const filePath = path.join(__dirname, '..', 'firebase-service-account.json');
    serviceAccount = require(filePath);
  } catch (error) {
    console.error("❌ firebase-service-account.json file not found in backend folder!", error.message);
    process.exit(1);
  }
}

// Firebase ကို Initialize လုပ်ခြင်း
if (admin.apps && !admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log("✅ Firebase Initialized successfully!");
}

module.exports = admin;