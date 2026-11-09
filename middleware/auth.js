const jwt = require("jsonwebtoken");
const User = require("../models/User");

const COOKIE_NAME = "blog_token";

function createToken(userId) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured.");
  return jwt.sign({ sub: userId.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
}

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });
}

async function optionalAuth(req, res, next) {
  try {
    const token = req.cookies && req.cookies[COOKIE_NAME];
    if (!token) return next();
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(payload.sub).select("name email");
    if (!req.user) clearAuthCookie(res);
    next();
  } catch (error) {
    clearAuthCookie(res);
    next();
  }
}

function requireAuth(req, res, next) {
  if (req.user) return next();
  if (req.originalUrl.startsWith("/api/")) {
    return res.status(401).json({ message: "Please log in to continue." });
  }
  return res.redirect("/login");
}

module.exports = {
  COOKIE_NAME, createToken, setAuthCookie, clearAuthCookie, optionalAuth, requireAuth
};
