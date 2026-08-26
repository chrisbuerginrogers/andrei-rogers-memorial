/**
 * Andrei Rogers memorial site — private backend for the Memories Wall
 * and the Photo Gallery.
 *
 * Paste this into Extensions > Apps Script on the Google Sheet that
 * collects your Form responses, then deploy it as a Web App (see README).
 *
 * What it does:
 *  - Reads the form responses sheet directly (the sheet itself stays
 *    private — it is never shared publicly).
 *  - Only returns rows whose "Approved" column is Yes/Y/True.
 *  - Never returns the email address column, even for approved rows.
 *  - Lists image files in the shared Photo Gallery Drive folder
 *    (call with ?type=photos).
 *
 * Column headers below are matched case- and whitespace-insensitively
 * against row 1 of your sheet. Update them here if you change your
 * Form's question wording.
 */

const HEADER_TIMESTAMP = "Timestamp";
const HEADER_NAME = "Your name";
const HEADER_RELATIONSHIP = "Your relationship to Andrei";
const HEADER_REFLECTION = "A memory or reflection";
const HEADER_PHOTOS = "Photos";
const HEADER_APPROVED = "Approved";

// The Drive folder shown on the Photo Gallery page.
const PHOTOS_FOLDER_ID = "1SxniwEeLPN8rCkpuSCle0WNWxyqK9qxz8WoZgGA8Q9F0fewFKECAS4hfmdizwj02jJ0SM3DA";

function doGet(e) {
  if (e && e.parameter && e.parameter.type === "photos") {
    return jsonResponse(listPhotos());
  }
  return jsonResponse(listMemories());
}

function listMemories() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) {
    return [];
  }

  const headers = values[0].map(h => String(h).trim().toLowerCase());
  const findCol = (name) => headers.indexOf(name.trim().toLowerCase());
  const idx = {
    timestamp: findCol(HEADER_TIMESTAMP),
    name: findCol(HEADER_NAME),
    relationship: findCol(HEADER_RELATIONSHIP),
    reflection: findCol(HEADER_REFLECTION),
    photos: findCol(HEADER_PHOTOS),
    approved: findCol(HEADER_APPROVED),
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

  return results;
}

function listPhotos() {
  const folder = DriveApp.getFolderById(PHOTOS_FOLDER_ID);
  const files = folder.getFiles();
  const results = [];

  while (files.hasNext()) {
    const file = files.next();
    if (file.getMimeType().indexOf("image/") !== 0) continue;
    const id = file.getId();
    results.push({
      name: file.getName(),
      thumbnail: "https://drive.google.com/thumbnail?id=" + id + "&sz=w800",
      viewUrl: "https://drive.google.com/file/d/" + id + "/view",
      created: file.getDateCreated().getTime(),
    });
  }

  results.sort((a, b) => b.created - a.created);
  return results;
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
