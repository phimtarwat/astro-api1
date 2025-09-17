
import Stripe from "stripe";
import { buffer } from "micro";
import { readMembers, appendMember } from "./utils/sheets";
import { generateUniqueId, generateToken } from "./utils/generator";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const packageType = session.metadata.packageType || "basic";

    const packageQuota = packageType === "pro" ? 100 : 30;
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 1);
    const expiryStr = expiry.toISOString().split("T")[0];

    const rows = await readMembers();
    const existingIds = rows.map(r => r[0]);

    const newUserId = generateUniqueId(existingIds);
    const newToken = generateToken();

    await appendMember([newUserId, newToken, expiryStr, packageQuota, 0, packageType]);
  }

  res.json({ received: true });
}
