const { customAlphabet } = require("nanoid");
const nodemailer = require("nodemailer");

const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 8);

function generateReferralCode() {
  return nanoid();
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
           <p>Check stats: <a href="${baseUrl}/api/survey/ref/${refCode}/stats">${baseUrl}/api/survey/ref/${refCode}/stats</a></p>`,
  });
  console.log("✅ Email sent:", info.messageId);
}

function withCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
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
