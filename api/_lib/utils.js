const nodemailer = require("nodemailer");
const crypto = require("crypto");

function generateReferralCode() {
  // Use crypto.randomUUID() which is available in Node.js 18+ and doesn't have module issues
  return crypto.randomUUID().replace(/-/g, '').substring(0, 8).toUpperCase();
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "465"),
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

async function sendRewardEmail(toEmail, { refCode, count, baseUrl }) {
  if (!toEmail) return;
  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: "🎉 You unlocked your reward!",
    text: `Congrats! Your referral code ${refCode} reached ${count} referrals. We will contact you soon to deliver your prize.`,
    html: `<h2>Congratulations!</h2>
           <p>Your code <b>${refCode}</b> has <b>${count}</b> referrals.</p>
           <p>You earned your reward 🎁.</p>
           <p>Check stats: <a href="${baseUrl}/?ref=${refCode}">${baseUrl}/?ref=${refCode}</a></p>`,
  });
  console.log("✅ Email sent:", info.messageId);
}

function withCORS(req, res) {
  // Allow your specific frontend domain
  const allowedOrigins = [
    "https://referral-survey-622ixo544-nairaalmelegys-projects.vercel.app",
    "https://referral-survey.vercel.app",
    "http://localhost:3000" // for local development
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  } else {
    // Fallback for development or if origin doesn't match
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Vary", "Origin");
}

async function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

module.exports = { generateReferralCode, sendRewardEmail, withCORS, readJsonBody };
