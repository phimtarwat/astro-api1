import { google } from "googleapis";

export async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_KEY),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

export async function readMembers() {
  const sheets = await getSheets();
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    range: "Members!A2:F",
  });
  return result.data.values || [];
}

export async function writeMember(rowIndex, updatedUsed) {
  const sheets = await getSheets();
  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.SHEET_ID,
    range: `E${rowIndex}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[updatedUsed]] },
  });
}

export async function appendMember(newRow) {
  const sheets = await getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SHEET_ID,
    range: "Members!A2:F",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [newRow] },
  });
}

