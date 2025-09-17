import { readMembers, writeMember } from "./utils/sheets";

export default async function handler(req, res) {
  const { user_id, token, question } = req.body;
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

  // ✅ หัก quota ตอนถามดวง
  const updatedUsed = parseInt(used) + 1;
  const rowIndex = rows.indexOf(user) + 2;
  await writeMember(rowIndex, updatedUsed);

  // 🔮 เรียก core function (mock ตรงนี้)
  const fortuneResult = `🔮 คำทำนายจากดวงดาว: "${question}" → [ผลลัพธ์ตัวอย่าง]`;

  return res.status(200).json({
    message: "Success",
    package: pkg,
    remaining: parseInt(quota) - updatedUsed,
    result: fortuneResult
  });
}

