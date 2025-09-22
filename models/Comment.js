// models/Comment.js
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: true,
    },
    name: { type: String, required: true },
    content: { type: String, required: true },
    approved: { type: Boolean, default: false }, // champ pour la modération
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
