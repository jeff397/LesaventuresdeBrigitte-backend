const mongoose = require("mongoose");
const slugify = require("slugify");

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    images: [{ url: String, public_id: String }],
    // 🔹 Référence à Category
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    blog: {
      type: String,
      required: true,
      enum: ["Villers-sur-Authie", "D'hier et d'aujourd'hui", "Somme-photos"],
    },
    blogSlug: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
);

// 🔹 Génération automatique du blogSlug + slug de l'article
articleSchema.pre("save", async function (next) {
  try {
    if (this.blog) {
      this.blogSlug = this.blog
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/['’]/g, "")
        .replace(/\s+/g, "-");
    }

    if (this.title) {
      let baseSlug = slugify(this.title, { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 1;

      while (await mongoose.models.Article.findOne({ slug })) {
        slug = `${baseSlug}-${counter++}`;
      }

      this.slug = slug;
    }

    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Article", articleSchema);
