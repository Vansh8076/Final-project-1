const express = require("express");
const Blog = require("../models/Blog");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/dashboard", requireAuth, async (req, res, next) => {
  try {
    const blogs = await Blog.find({ author: req.user._id }).sort({ createdAt: -1 });
    res.render("dashboard", { title: "My dashboard", blogs });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
