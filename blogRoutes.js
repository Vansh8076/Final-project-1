const express = require("express");
const { body, validationResult } = require("express-validator");
const Blog = require("../models/Blog");
const { CATEGORIES } = require("../models/Blog");
const { requireAuth } = require("../middleware/auth");
const { requireBlogOwner } = require("../middleware/ownership");

const router = express.Router();

router.get("/blogs", async (req, res, next) => {
  try {
    const q = String(req.query.q || "").trim();
    const category = String(req.query.category || "").trim();
    const filter = {};
    if (q) filter.$text = { $search: q };
    if (category && CATEGORIES.includes(category)) filter.category = category;

    const blogs = await Blog.find(filter)
      .populate("author", "name")
      .sort({ createdAt: -1 })
      .limit(100);
    res.render("blogs/index", { title: "Explore blogs", blogs, q, category, CATEGORIES });
  } catch (error) {
    next(error);
  }
});

router.get("/blogs/new", requireAuth, (req, res) => {
  res.render("blogs/form", {
    title: "Write a blog", heading: "Create a blog", blog: {},
    errors: [], CATEGORIES, formAction: "/blogs"
  });
});

router.post("/blogs", requireAuth, [
  body("title").trim().isLength({ min: 3, max: 120 }).withMessage("Title must be 3–120 characters."),
  body("content").trim().isLength({ min: 10, max: 20000 }).withMessage("Content must be 10–20,000 characters."),
  body("category").isIn(CATEGORIES).withMessage("Choose a valid category.")
], async (req, res, next) => {
  try {
    const errors = validationResult(req).array().map(e => e.msg);
    if (errors.length) return res.status(400).render("blogs/form", {
      title: "Write a blog", heading: "Create a blog", blog: req.body,
      errors, CATEGORIES, formAction: "/blogs"
    });
    const blog = await Blog.create({
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      author: req.user._id
    });
    res.redirect(`/blogs/${blog._id}`);
  } catch (error) {
    next(error);
  }
});

router.get("/blogs/:id", async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("author", "name");
    if (!blog) return res.status(404).render("404", { title: "Blog not found" });
    res.render("blogs/show", { title: blog.title, blog });
  } catch (error) {
    if (error.name === "CastError") return res.status(404).render("404", { title: "Blog not found" });
    next(error);
  }
});

router.get("/blogs/:id/edit", requireAuth, requireBlogOwner, (req, res) => {
  res.render("blogs/form", {
    title: "Edit blog", heading: "Edit your blog", blog: req.blog,
    errors: [], CATEGORIES, formAction: `/blogs/${req.blog._id}/update`
  });
});

router.post("/blogs/:id/update", requireAuth, requireBlogOwner, [
  body("title").trim().isLength({ min: 3, max: 120 }).withMessage("Title must be 3–120 characters."),
  body("content").trim().isLength({ min: 10, max: 20000 }).withMessage("Content must be 10–20,000 characters."),
  body("category").isIn(CATEGORIES).withMessage("Choose a valid category.")
], async (req, res, next) => {
  try {
    const errors = validationResult(req).array().map(e => e.msg);
    if (errors.length) return res.status(400).render("blogs/form", {
      title: "Edit blog", heading: "Edit your blog", blog: { ...req.body, _id: req.params.id },
      errors, CATEGORIES, formAction: `/blogs/${req.params.id}/update`
    });
    req.blog.title = req.body.title;
    req.blog.content = req.body.content;
    req.blog.category = req.body.category;
    await req.blog.save();
    res.redirect(`/blogs/${req.blog._id}`);
  } catch (error) {
    next(error);
  }
});

router.post("/blogs/:id/delete", requireAuth, requireBlogOwner, async (req, res, next) => {
  try {
    await req.blog.deleteOne();
    res.redirect("/dashboard");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
