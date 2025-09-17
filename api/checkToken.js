import { readMembers } from "./utils/sheets";

export default async function handler(req, res) {
  const { user_id, token } = req.query;
  const rows = await readMembers();
  const user = rows.find(r => r[0] === user_id || r[1] === token);

  if (!user) return res.status(404).json({ error: "User not found" });

  const [uid, tok, expiry, quota, used, pkg] = user;
  const today = new Date().toISOString().split("T")[0];

  if (tok !== token || expiry < today) {
    return res.status(403).json({ 
      error: "Token expired",
      checkout: "/api/createCheckout"
    });
  }

  if (parseInt(used) >= parseInt(quota)) {
    return res.status(403).json({ 
      error: "Quota exceeded",
      checkout: "/api/createCheckout"
    });
  }

  return res.status(200).json({
    message: "Valid",
    package: pkg,
    remaining: parseInt(quota) - parseInt(used),
  });
}

