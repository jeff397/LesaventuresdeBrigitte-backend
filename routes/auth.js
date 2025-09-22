const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Route pour créer le premier admin
router.post("/register-initial-admin", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifie si un admin existe déjà
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin déjà créé" });
    }

    // Hash du mot de passe
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newAdmin = new User({
      email,
      passwordHash,
      role: "admin",
    });

    await newAdmin.save();

    res.status(201).json({ message: "Admin créé avec succès !" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Route login
router.post("/login", async (req, res) => {
  const { email, password } = req.body; // <-- on récupère l'email et password séparément

  try {
    const user = await User.findOne({ email }); // <-- ici uniquement l'email
    if (!user)
      return res.status(400).json({ message: "Utilisateur non trouvé" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(400).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
