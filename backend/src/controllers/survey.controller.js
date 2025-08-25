const { z } = require("zod");
const User = require("../models/User");
const { generateReferralCode } = require("../utils/referral");
const { sendRewardEmail } = require("../utils/mailer");

const submitSchema = z.object({
  phone: z.string().trim().min(6).optional(),
  email: z.string().email().optional(),
  answers: z.record(z.any()),          // survey answers (free shape)
  ref: z.string().trim().optional(),   // optional referrer code
});

const REWARD_TARGET = parseInt(process.env.REWARD_TARGET || "5", 10);
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function submitSurvey(req, res, next) {
  try {
    const payload = submitSchema.parse(req.body);

    if (!payload.phone && !payload.email) {
      return res.status(400).json({ error: "Provide at least phone or email." });
    }

    const referralCode = generateReferralCode();

    // Create this user (unique phone or email prevents duplicates)
    const user = await User.create({
      phone: payload.phone || undefined,
      email: payload.email || undefined,
      surveyResponses: payload.answers || {},
      referralCode,
      referredBy: payload.ref || null,
    });

    // If referred, atomically bump the referrer's count only once per new user
    if (payload.ref) {
      const referrer = await User.findOneAndUpdate(
        { referralCode: payload.ref },
        { $inc: { referralsCount: 1 } },
        { new: true }
      );

      if (referrer && !referrer.rewardGiven && referrer.referralsCount >= REWARD_TARGET) {
        // try email if referrer has one
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

    const shareLink = `${BASE_URL}/api/survey/start?ref=${referralCode}`;

    return res.status(201).json({
      message: "Survey submitted",
      referralCode,
      shareLink,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Phone/email already used." });
    }
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.flatten() });
    }
    next(err);
  }
}

async function getStats(req, res, next) {
  try {
    const { code } = req.params;
    const user = await User.findOne({ referralCode: code }).lean();
    if (!user) return res.status(404).json({ error: "Not found" });

    return res.json({
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      referralsCount: user.referralsCount,
      rewardGiven: user.rewardGiven,
      // Expose target so frontend can render a progress bar
      rewardTarget: REWARD_TARGET,
      shareLink: `${BASE_URL}/api/survey/start?ref=${user.referralCode}`,
      createdAt: user.createdAt,
    });
  } catch (e) {
    next(e);
  }
}

async function startSurvey(req, res) {
  // This endpoint is just a landing for links like ?ref=CODE.
  // Your frontend can read the ref and show the real survey UI.
  const { ref } = req.query;
  return res.json({
    message: "Survey start",
    ref: ref || null,
    howTo: "POST your answers to /api/survey/submit with optional 'ref'.",
  });
}

module.exports = { submitSurvey, getStats, startSurvey };