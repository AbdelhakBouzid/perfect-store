module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const payload = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const email = String(payload.email || "").trim();
    const message = String(payload.message || "").trim();

    if (!email || !message) {
      return res.status(400).json({ error: "Email and message are required" });
    }

    if (message.length < 5) {
      return res.status(400).json({ error: "Message is too short" });
    }

    console.log("[contact]", {
      email,
      message,
      createdAt: new Date().toISOString()
    });

    return res.status(200).json({
      ok: true,
      id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`
    });
  } catch (_error) {
    return res.status(500).json({ error: "Unable to process contact message" });
  }
};
