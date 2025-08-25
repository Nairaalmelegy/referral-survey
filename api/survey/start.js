const { withCORS } = require("../_lib/utils");

module.exports = async function handler(req, res) {
  withCORS(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { ref } = req.query || {};
  return res.status(200).json({
    message: "Survey start",
    ref: ref || null,
    howTo: "POST your answers to /api/survey/submit with optional 'ref'.",
  });
};
