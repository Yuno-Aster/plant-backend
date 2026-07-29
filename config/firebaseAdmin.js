const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// အခုဆိုရင် admin.credential ဆိုတာ ရှိနေပါပြီ
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

console.log("✅ Firebase Initialized successfully!");

module.exports = admin;