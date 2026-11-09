const Blog = require("../models/Blog");

async function requireBlogOwner(req, res, next) {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      if (req.originalUrl.startsWith("/api/")) {
        return res.status(404).json({ message: "Blog not found." });
      }
      return res.status(404).render("404", { title: "Blog not found" });
    }
    if (blog.author.toString() !== req.user._id.toString()) {
      if (req.originalUrl.startsWith("/api/")) {
        return res.status(403).json({ message: "You can only change your own blogs." });
      }
      return res.status(403).render("error", {
        title: "Access denied",
        message: "You can only edit or delete blogs that you created."
      });
    }
    req.blog = blog;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { requireBlogOwner };
