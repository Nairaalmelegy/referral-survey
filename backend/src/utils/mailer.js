const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "465"),
  secure: true, // true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendRewardEmail(toEmail, { refCode, count, baseUrl }) {
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

module.exports = { sendRewardEmail };
