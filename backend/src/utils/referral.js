const {customAlphabet} = require("nanoid");
const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 8);

function generateReferralCode() {
    return nanoid();
}

module.exports = {generateReferralCode};