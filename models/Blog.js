const mongoose = require("mongoose");

const CATEGORIES = ["Technology", "Lifestyle", "Travel", "Food", "Education", "Other"];

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required."],
    trim: true,
    minlength: 3,
    maxlength: 120
  },
  content: {
    type: String,
    required: [true, "Content is required."],
    trim: true,
    minlength: 10,
    maxlength: 20000
  },
  category: {
    type: String,
    enum: CATEGORIES,
    default: "Other"
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  }
}, { timestamps: true });

blogSchema.index({ title: "text", content: "text" });

module.exports = mongoose.model("Blog", blogSchema);
module.exports.CATEGORIES = CATEGORIES;
