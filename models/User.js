const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "admin",
    },
  },
  { timestamps: true }
);

// Méthode pour comparer le mot de passe
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model("User", userSchema);
