// config/multer.js
const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB ထက်မကြီးသော ပုံများကိုသာ လက်ခံမည် (လိုသလို ချိန်နိုင်သည်)
  }
});

module.exports = upload;