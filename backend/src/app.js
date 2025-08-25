const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const surveyRoutes = require("./routes/survey.routes");

const app = express();

app.use(helmet());



// Allow your frontend domain explicitly
// app.use(cors({
//   origin: "https://referral-survey-f99v4unyp-nairaalmelegys-projects.vercel.app",
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   credentials: true
// }));

// ✅ Allow your frontend domain
app.use(cors({
  origin: "https://referral-survey-622ixo544-nairaalmelegys-projects.vercel.app",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));



app.options("*", cors());

app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// Basic anti-abuse rate limit
app.use(
  "/api/",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);



app.get("/health", (_req, res) => res.json({ ok: true }));

// Your routes...
app.post("/api/survey/submit", (req, res) => {
  res.json({ message: "Survey submitted!" });
});

app.use("/api/survey", surveyRoutes);

// Centralized error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
