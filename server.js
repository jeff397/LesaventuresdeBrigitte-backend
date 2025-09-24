// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload");
const { connectDB, connectCloudinary } = require("./config/db");
const authRoutes = require("./routes/auth");
const articleRoutes = require("./routes/articles");
const categoryRoutes = require("./routes/categories");
const commentRoutes = require("./routes/comments");
const cloudinary = require("cloudinary").v2;

// 🔹 Charger les variables d'environnement
dotenv.config();

const app = express();

// 🔹 Middlewares
app.use(
  cors({
    origin: [
      "http://localhost:5173", // dev local
      "https://lesaventuresde-brigitte.vercel.app", // prod Vercel
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(fileUpload({ useTempFiles: true }));

// 🔹 Routes
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/comments", commentRoutes);

// 🔹 Upload Cloudinary
app.post("/api/upload", async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = req.files.file;
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "articles",
    });

    res.json({ url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

// 🔹 Route test
app.get("/", (req, res) => res.send("Hello Backend 🚀"));

// 🔹 Connexion à MongoDB et Cloudinary avant de démarrer le serveur
connectDB()
  .then(() => connectCloudinary())
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ Erreur au démarrage :", err);
    process.exit(1);
  });
