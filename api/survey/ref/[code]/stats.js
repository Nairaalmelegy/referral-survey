const { connectDB } = require("../../../_lib/db");
const User = require("../../../_lib/User");
const { withCORS } = require("../../../_lib/utils");

const REWARD_TARGET = parseInt(process.env.REWARD_TARGET || "5", 10);
const BASE_URL = process.env.BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

module.exports = async function handler(req, res) {
  withCORS(req, res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    await connectDB(process.env.MONGO_URI);

    const { code } = req.query;
    const user = await User.findOne({ referralCode: code }).lean();
    if (!user) return res.status(404).json({ error: "Not found" });

    return res.json({
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      referralsCount: user.referralsCount,
      rewardGiven: user.rewardGiven,
      rewardTarget: REWARD_TARGET,
      shareLink: `${BASE_URL}/api/survey/start?ref=${user.referralCode}`,
      createdAt: user.createdAt,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
};
