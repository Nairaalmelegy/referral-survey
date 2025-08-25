const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    phone: { type: String, index: true, unique: true, sparse: true },
    email: { type: String, index: true, sparse: true },
    referralCode: { type: String, required: true, unique: true, index: true },
    referredBy: { type: String, default: null },
    referralsCount: { type: Number, default: 0 },
    rewardGiven: { type: Boolean, default: false },
    surveyResponses: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

UserSchema.index({ referredBy: 1 });

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
