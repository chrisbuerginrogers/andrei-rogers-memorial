/**
 * Andrei Rogers memorial site — private backend for the Memories Wall.
 *
 * Paste this into Extensions > Apps Script on the Google Sheet that
 * collects your Form responses, then deploy it as a Web App (see README).
 *
 * What it does:
 *  - Reads the form responses sheet directly (the sheet itself stays
 *    private — it is never shared publicly).
 *  - Only returns rows whose "Approved" column is Yes/Y/True.
 *  - Never returns the email address column, even for approved rows.
 *
 * Expected column headers (row 1) — matches the default order Google
 * Forms writes responses in when the form questions are created in this
 * order: Timestamp, Your Name, Your Email, Your Relationship to Andrei
 * (optional), Your Memory or Reflection, Photos (optional), Approved.
 * If your headers differ, edit the HEADER constants below to match.
 */

const HEADER_TIMESTAMP = "Timestamp";
const HEADER_NAME = "Your Name";
const HEADER_RELATIONSHIP = "Your Relationship to Andrei (optional)";
const HEADER_REFLECTION = "Your Memory or Reflection";
const HEADER_PHOTOS = "Photos (optional)";
const HEADER_APPROVED = "Approved";

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) {
    return jsonResponse([]);
  }

  const headers = values[0];
  const idx = {
    timestamp: headers.indexOf(HEADER_TIMESTAMP),
    name: headers.indexOf(HEADER_NAME),
    relationship: headers.indexOf(HEADER_RELATIONSHIP),
    reflection: headers.indexOf(HEADER_REFLECTION),
    photos: headers.indexOf(HEADER_PHOTOS),
    approved: headers.indexOf(HEADER_APPROVED),
  };

  const results = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const approvedRaw = idx.approved >= 0 ? String(row[idx.approved] || "").trim().toLowerCase() : "";
    const isApproved = ["yes", "y", "true"].includes(approvedRaw);
    if (!isApproved) continue;

    const photosRaw = idx.photos >= 0 ? String(row[idx.photos] || "") : "";
    const photos = photosRaw
      .split(/[,\n]+/)
      .map(s => s.trim())
      .filter(Boolean);

    results.push({
      timestamp: idx.timestamp >= 0 ? toIso(row[idx.timestamp]) : "",
      name: idx.name >= 0 ? row[idx.name] : "",
      relationship: idx.relationship >= 0 ? row[idx.relationship] : "",
      reflection: idx.reflection >= 0 ? row[idx.reflection] : "",
      photos: photos,
    });
  }

  return jsonResponse(results);
}

function toIso(value) {
  if (value instanceof Date) return value.toISOString();
  const d = new Date(value);
  return isNaN(d) ? "" : d.toISOString();
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
