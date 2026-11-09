require("dotenv").config();

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const { optionalAuth } = require("./middleware/auth");
const authRoutes = require("./routes/authRoutes");
const blogRoutes = require("./routes/blogRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const apiRoutes = require("./routes/apiRoutes");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("trust proxy", 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"]
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.json({ limit: "20kb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(optionalAuth);

app.use("/api/auth", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." }
}));

app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  res.locals.currentPath = req.path;
  next();
});

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.get("/", (req, res) => res.redirect("/blogs"));

app.use("/", authRoutes);
app.use("/", blogRoutes);
app.use("/", dashboardRoutes);
app.use("/api", apiRoutes);

app.use((req, res) => {
  res.status(404).render("404", { title: "Page not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  if (req.originalUrl.startsWith("/api/")) {
    return res.status(err.status || 500).json({
      message: err.status ? err.message : "Internal server error"
    });
  }
  res.status(err.status || 500).render("error", {
    title: "Something went wrong",
    message: process.env.NODE_ENV === "production"
      ? "Please try again later."
      : err.message
  });
});

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Blog app running on port ${PORT}`));
  })
  .catch((error) => {
    console.error("Unable to start because database connection failed:", error.message);
    process.exit(1);
  });

module.exports = app;
