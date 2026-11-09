const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const Blog = require("../models/Blog");
const { CATEGORIES } = require("../models/Blog");
const { requireAuth, createToken, setAuthCookie, clearAuthCookie } = require("../middleware/auth");
const { requireBlogOwner } = require("../middleware/ownership");

const router = express.Router();

router.post("/auth/register", [
  body("name").trim().isLength({ min: 2, max: 60 }),
  body("email").isEmail(),
  body("password").isLength({ min: 8 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const email = req.body.email.toLowerCase().trim();
    if (await User.findOne({ email })) return res.status(409).json({ message: "Email already registered." });
    const user = await User.create({ name: req.body.name, email, password: req.body.password });
    setAuthCookie(res, createToken(user._id));
    res.status(201).json({ message: "Account created.", user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) { next(error); }
});

router.post("/auth/login", async (req, res, next) => {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(String(req.body.password || "")))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    setAuthCookie(res, createToken(user._id));
    res.json({ message: "Logged in.", user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) { next(error); }
});

router.post("/auth/logout", (req, res) => {
  clearAuthCookie(res);
  res.json({ message: "Logged out." });
});

router.get("/auth/me", requireAuth, (req, res) => {
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email } });
});

router.get("/blogs", async (req, res, next) => {
  try {
    const filter = {};
    const q = String(req.query.q || "").trim();
    const category = String(req.query.category || "").trim();
    if (q) filter.$text = { $search: q };
    if (category && CATEGORIES.includes(category)) filter.category = category;
    const blogs = await Blog.find(filter).populate("author", "name").sort({ createdAt: -1 }).limit(100);
    res.json({ count: blogs.length, blogs });
  } catch (error) { next(error); }
});

router.get("/blogs/:id", async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("author", "name");
    if (!blog) return res.status(404).json({ message: "Blog not found." });
    res.json({ blog });
  } catch (error) { next(error); }
});

router.post("/blogs", requireAuth, [
  body("title").trim().isLength({ min: 3, max: 120 }),
  body("content").trim().isLength({ min: 10, max: 20000 }),
  body("category").optional().isIn(CATEGORIES)
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const blog = await Blog.create({
      title: req.body.title, content: req.body.content,
      category: req.body.category || "Other", author: req.user._id
    });
    res.status(201).json({ blog });
  } catch (error) { next(error); }
});

router.put("/blogs/:id", requireAuth, requireBlogOwner, async (req, res, next) => {
  try {
    const allowed = ["title", "content", "category"];
    for (const key of allowed) if (req.body[key] !== undefined) req.blog[key] = req.body[key];
    await req.blog.save();
    res.json({ blog: req.blog });
  } catch (error) { next(error); }
});

router.delete("/blogs/:id", requireAuth, requireBlogOwner, async (req, res, next) => {
  try {
    await req.blog.deleteOne();
    res.json({ message: "Blog deleted." });
  } catch (error) { next(error); }
});

module.exports = router;
