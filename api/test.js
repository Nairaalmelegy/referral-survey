const { withCORS } = require("./_lib/utils");

module.exports = async function handler(req, res) {
  console.log("🧪 Test endpoint called");
  console.log("🧪 Method:", req.method);
  console.log("🧪 URL:", req.url);
  console.log("🧪 Headers:", req.headers);
  
  withCORS(req, res);
  
  if (req.method === "OPTIONS") return res.status(200).end();
  
  return res.status(200).json({
    message: "Test endpoint working",
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });
};
