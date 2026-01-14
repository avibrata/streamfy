const admin = require("firebase-admin");
const dotenv = require("dotenv");

dotenv.config();

// Initialize Firebase Admin
// Expecting FIREBASE_SERVICE_ACCOUNT to be a JSON string in environment variables
// OR separate variables. For Railway/generic deploy, a JSON string is often easiest, 
// or parsing individual fields. here we will assume a JSON string or local file for dev.

let serviceAccount;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // Fallback for local development if file exists
    serviceAccount = require("./service-account-key.json");
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log("🔥 Firebase Admin Initialized Successfully");
  console.log("🆔 Connected to Project:", serviceAccount.project_id); // Log the Project ID
} catch (error) {
  console.error("❌ Firebase Admin Initialization Failed:", error.message);
  // We don't exit process here strictly, but DB ops will fail.
}

const db = admin.firestore();

module.exports = { db, admin };
