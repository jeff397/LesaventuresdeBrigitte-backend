const jwt = require("jsonwebtoken");

// Middleware pour vérifier que l'utilisateur est connecté
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization; // Header : Bearer <token>

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token manquant ou invalide" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // contient id, email, role
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalide" });
  }
};

// Middleware pour vérifier si l'utilisateur est admin
const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès refusé : Admin seulement" });
  }
  next();
};

module.exports = { verifyToken, verifyAdmin };
