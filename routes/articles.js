const express = require("express");
const router = express.Router();
const Article = require("../models/Article");
const { verifyToken, verifyAdmin } = require("../middleware/auth");
const cloudinary = require("cloudinary").v2;

// 🔹 Fonction utilitaire pour générer le slug
const slugify = (text) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // supprime les accents
    .replace(/['’]/g, "") // supprime apostrophes
    .replace(/\s+/g, "-"); // remplace les espaces par des tirets
};

// ✅ Créer un article (admin seulement)
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { title, subtitle, content, images, category, blog } = req.body;

    if (!blog) return res.status(400).json({ message: "Le blog est requis" });

    const blogSlug = slugify(blog);
    const articleSlug = slugify(title);

    const newArticle = new Article({
      title,
      subtitle,
      content,
      images: images || [],
      category,
      blog,
      blogSlug,
      slug: articleSlug,
    });

    await newArticle.save();
    res.status(201).json(newArticle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ Lire tous les articles (avec nom de catégorie)
router.get("/", async (req, res) => {
  try {
    const { blogSlug } = req.query;
    let query = {};
    if (blogSlug) query.blogSlug = blogSlug;

    // 🔹 populate("category", "title slug")
    const articles = await Article.find(query)
      .populate("category", "title slug")
      .sort({ createdAt: -1 });

    res.json(articles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ Lire un article par ID (avec nom de catégorie)
router.get("/:id", async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).populate(
      "category",
      "title"
    ); // 🔹 ici
    if (!article)
      return res.status(404).json({ message: "Article non trouvé" });
    res.json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ Lire un article par slug (avec nom de catégorie)
router.get("/slug/:slug", async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug }).populate(
      "category",
      "title slug"
    );

    if (!article)
      return res.status(404).json({ message: "Article non trouvé" });

    res.json(article);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Mettre à jour un article (admin seulement)
router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    if (req.body.blog) req.body.blogSlug = slugify(req.body.blog);
    if (req.body.title) req.body.slug = slugify(req.body.title);

    const updatedArticle = await Article.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("category", "title"); // 🔹 ici
    if (!updatedArticle)
      return res.status(404).json({ message: "Article non trouvé" });
    res.json(updatedArticle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ Supprimer une image d'un article
router.delete(
  "/:id/images/:public_id",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const { id, public_id } = req.params;
      if (!public_id)
        return res.status(400).json({ message: "public_id requis" });

      const cloudResult = await cloudinary.uploader.destroy(public_id, {
        resource_type: "image",
      });

      if (cloudResult.result !== "ok" && cloudResult.result !== "not found") {
        return res.status(500).json({
          message: "Erreur suppression Cloudinary",
          cloudResult,
        });
      }

      const updatedArticle = await Article.findByIdAndUpdate(
        id,
        { $pull: { images: { public_id } } },
        { new: true }
      ).populate("category", "title"); // 🔹 ici

      if (!updatedArticle)
        return res.status(404).json({ message: "Article non trouvé" });

      return res.json({
        message: "Image supprimée avec succès",
        article: updatedArticle,
        cloudResult,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Erreur serveur", error: err.message });
    }
  }
);

// ✅ Supprimer un article
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id);
    if (!article)
      return res.status(404).json({ message: "Article non trouvé" });

    for (const img of article.images) {
      if (img.public_id) {
        await cloudinary.uploader.destroy(img.public_id, {
          resource_type: "image",
        });
      }
    }

    await Article.findByIdAndDelete(id);

    res.json({ message: "Article supprimé avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
