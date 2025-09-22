const express = require("express");
const router = express.Router();
const Category = require("../models/Category");

// Helper pour générer le slug depuis le nom
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");

router.post("/", async (req, res) => {
  try {
    const { name, description, image } = req.body;
    if (!name) return res.status(400).json({ message: "Le nom est requis" });

    const newCategory = new Category({
      title: name,
      slug: slugify(name),
      description: description || "",
      image: image || "",
    });

    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Erreur lors de la création de la catégorie" });
  }
});

router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des catégories" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedCategory);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour de la catégorie" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Catégorie supprimée" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de la catégorie" });
  }
});

module.exports = router;
