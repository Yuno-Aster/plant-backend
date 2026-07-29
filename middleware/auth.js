const admin = require('../config/firebaseAdmin'); // ခုနကဆောက်ထားတဲ့ config ကို ခေါ်သုံးမယ်

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; 
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid Token" });
  }
};

module.exports = verifyToken;