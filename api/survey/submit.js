const { z } = require("zod");
const { connectDB } = require("../_lib/db");
const User = require("../_lib/User");
const { generateReferralCode, sendRewardEmail, withCORS, readJsonBody } = require("../_lib/utils");

const submitSchema = z.object({
  phone: z.string().trim().min(6).optional(),
  email: z.string().email().optional(),
  answers: z.record(z.any()),
  ref: z.string().trim().optional(),
});

const REWARD_TARGET = parseInt(process.env.REWARD_TARGET || "5", 10);
const BASE_URL = process.env.BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

module.exports = async function handler(req, res) {
  console.log("🔍 Request method:", req.method);
  console.log("🔍 Request headers:", req.headers);
  console.log("🔍 Request URL:", req.url);
  console.log("🔍 Environment check - MONGO_URI:", process.env.MONGO_URI ? "SET" : "NOT SET");
  console.log("🔍 Environment check - VERCEL_URL:", process.env.VERCEL_URL || "NOT SET");
  
  withCORS(req, res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    console.log("🔍 Connecting to database...");
    if (!process.env.MONGO_URI) {
      console.error("🔍 MONGO_URI environment variable is not set");
      return res.status(500).json({ error: "Database configuration missing" });
    }
    await connectDB(process.env.MONGO_URI);
    console.log("🔍 Database connected successfully");

    const payload = submitSchema.parse(await readJsonBody(req));
    console.log("🔍 Payload received:", payload);

    if (!payload.phone && !payload.email) {
      return res.status(400).json({ error: "Provide at least phone or email." });
    }

    const referralCode = generateReferralCode();

    const user = await User.create({
      phone: payload.phone || undefined,
      email: payload.email || undefined,
      surveyResponses: payload.answers || {},
      referralCode,
      referredBy: payload.ref || null,
    });

    if (payload.ref) {
      const referrer = await User.findOneAndUpdate(
        { referralCode: payload.ref },
        { $inc: { referralsCount: 1 } },
        { new: true }
      );

      if (referrer && !referrer.rewardGiven && referrer.referralsCount >= REWARD_TARGET) {
        if (referrer.email) {
          await sendRewardEmail(referrer.email, {
            refCode: referrer.referralCode,
            count: referrer.referralsCount,
            baseUrl: BASE_URL,
          });
        }
        referrer.rewardGiven = true;
        await referrer.save();
      }
    }

    const shareLink = `${BASE_URL}/?ref=${referralCode}`;

    return res.status(201).json({
      message: "Survey submitted",
      referralCode,
      shareLink,
    });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ error: "Phone/email already used." });
    }
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.flatten() });
    }
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
