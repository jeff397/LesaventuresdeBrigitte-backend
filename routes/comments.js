const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

// 🔹 GET tous les commentaires (admin)
router.get("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    console.log("📢 Route GET /api/comments appelée !");
    const comments = await Comment.find()
      .sort({ createdAt: -1 })
      .populate("article", "title");

    console.log("📢 Commentaires trouvés :", comments.length);
    res.json(comments);
  } catch (err) {
    console.error("❌ Erreur route /api/comments :", err);
    res.status(500).json({ message: err.message });
  }
});

// 🔹 GET commentaires d'un article (public)
router.get("/:articleId", async (req, res) => {
  try {
    const comments = await Comment.find({ article: req.params.articleId }).sort(
      { createdAt: -1 }
    );
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 POST nouveau commentaire (public)
router.post("/", async (req, res) => {
  try {
    const { article, name, content } = req.body;
    if (!article || !name || !content)
      return res.status(400).json({ message: "Tous les champs sont requis" });

    const newComment = new Comment({ article, name, content, approved: false });
    await newComment.save();
    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 PATCH approbation commentaire (admin)
router.patch("/:id/approve", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const updated = await Comment.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 DELETE commentaire (admin)
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: "Commentaire supprimé" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
