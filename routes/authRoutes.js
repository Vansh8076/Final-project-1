const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const {
  createToken, setAuthCookie, clearAuthCookie, requireAuth
} = require("../middleware/auth");

const router = express.Router();

router.get("/register", (req, res) => {
  if (req.user) return res.redirect("/dashboard");
  res.render("auth/register", { title: "Create account", errors: [] });
});

router.post("/register", [
  body("name").trim().isLength({ min: 2, max: 60 }).withMessage("Name must be 2–60 characters."),
  body("email").trim().isEmail().withMessage("Enter a valid email address."),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters.")
], async (req, res, next) => {
  try {
    const errors = validationResult(req).array().map(e => e.msg);
    if (errors.length) return res.status(400).render("auth/register", {
      title: "Create account", errors, form: req.body
    });

    const email = req.body.email.toLowerCase().trim();
    if (await User.findOne({ email })) {
      return res.status(409).render("auth/register", {
        title: "Create account", errors: ["An account with this email already exists."],
        form: req.body
      });
    }

    const user = await User.create({
      name: req.body.name.trim(),
      email,
      password: req.body.password
    });
    setAuthCookie(res, createToken(user._id));
    res.redirect("/dashboard");
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).render("auth/register", {
        title: "Create account", errors: ["An account with this email already exists."],
        form: req.body
      });
    }
    next(error);
  }
});

router.get("/login", (req, res) => {
  if (req.user) return res.redirect("/dashboard");
  res.render("auth/login", { title: "Log in", errors: [] });
});

router.post("/login", async (req, res, next) => {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();
    const password = String(req.body.password || "");
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).render("auth/login", {
        title: "Log in", errors: ["Email or password is incorrect."], form: { email }
      });
    }
    setAuthCookie(res, createToken(user._id));
    res.redirect("/dashboard");
  } catch (error) {
    next(error);
  }
});

router.post("/logout", (req, res) => {
  clearAuthCookie(res);
  res.redirect("/blogs");
});

router.get("/profile", requireAuth, (req, res) => {
  res.render("profile", { title: "My profile", success: "", errors: [] });
});

router.post("/profile", requireAuth, [
  body("name").trim().isLength({ min: 2, max: 60 }).withMessage("Name must be 2–60 characters.")
], async (req, res, next) => {
  try {
    const errors = validationResult(req).array().map(e => e.msg);
    if (errors.length) return res.status(400).render("profile", {
      title: "My profile", success: "", errors
    });
    req.user.name = req.body.name.trim();
    await req.user.save();
    res.render("profile", { title: "My profile", success: "Profile updated successfully.", errors: [] });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
