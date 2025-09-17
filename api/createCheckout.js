import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { packageType } = req.query;

  const priceMap = {
    basic: "price_basic_id",
    pro: "price_pro_id",
  };

  if (!priceMap[packageType]) {
    return res.status(400).json({ error: "Invalid package" });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{ price: priceMap[packageType], quantity: 1 }],
    mode: "payment",
    success_url: "https://yourdomain.com/success",
    cancel_url: "https://yourdomain.com/cancel",
    metadata: { packageType }
  });

  return res.json({ url: session.url });
}

