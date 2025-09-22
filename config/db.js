const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

// Connexion MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connecté !");
  } catch (err) {
    console.error("❌ Erreur MongoDB :", err.message);
    process.exit(1);
  }
};

// Configuration Cloudinary
const connectCloudinary = () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log("✅ Cloudinary configuré !");
  } catch (err) {
    console.error("❌ Erreur Cloudinary :", err.message);
    process.exit(1);
  }
};

module.exports = { connectDB, connectCloudinary };
