module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return res.status(500).json({ error: "Missing STRIPE_SECRET_KEY" });
  }

  try {
    const payload = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const amount = Number(payload.amount || 0);
    const currency = String(payload.currency || "usd").toLowerCase();
    const metadata = payload.metadata && typeof payload.metadata === "object" ? payload.metadata : {};

    if (!Number.isInteger(amount) || amount < 50) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const form = new URLSearchParams();
    form.set("amount", String(amount));
    form.set("currency", currency);
    form.set("automatic_payment_methods[enabled]", "true");

    Object.entries(metadata).forEach(([key, value]) => {
      form.set(`metadata[${key}]`, String(value));
    });

    const stripeResponse = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: form.toString()
    });

    const stripeData = await stripeResponse.json();

    if (!stripeResponse.ok) {
      return res.status(stripeResponse.status).json({
        error: stripeData?.error?.message || "Failed to create payment intent"
      });
    }

    return res.status(200).json({
      clientSecret: stripeData.client_secret
    });
  } catch (_error) {
    return res.status(500).json({ error: "Server error while creating payment intent" });
  }
};
