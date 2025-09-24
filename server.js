const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload"); // <- pour gérer les fichiers
const { connectDB, connectCloudinary } = require("./config/db");
const authRoutes = require("./routes/auth");
const articleRoutes = require("./routes/articles");
const categoryRoutes = require("./routes/categories");
const cloudinary = require("cloudinary").v2;
const commentRoutes = require("./routes/comments");

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(fileUpload({ useTempFiles: true })); // important pour req.files

// Routes existantes
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/categories", categoryRoutes);

app.use("/api/comments", commentRoutes);

// Connect DB et Cloudinary
connectDB();
connectCloudinary();

app.post("/api/upload", async (req, res) => {
  try {
    if (!req.files || !req.files.file)
      return res.status(400).json({ message: "No file uploaded" });
    const file = req.files.file;
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "articles",
    });
    // retourner url ET public_id
    res.json({ url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

// Route test
app.get("/", (req, res) => {
  res.send("Hello Backend 🚀");
});

// Lancement du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
