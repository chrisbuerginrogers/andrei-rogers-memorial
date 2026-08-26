// ============================================================
// Site configuration — fill these in as you set each piece up.
// See README.md for step-by-step setup instructions.
// ============================================================
window.SITE_CONFIG = {

  // The URL of your deployed Google Apps Script Web App (see apps-script/Code.gs
  // and the README). This is what powers the Memories Wall — it privately reads
  // the response sheet and only returns approved reflections (never email
  // addresses). Looks like: https://script.google.com/macros/s/AKfycb.../exec
  MEMORIES_API_URL: "https://script.google.com/macros/s/AKfycbz1mPVZV7VZUIuR6umZxBrNybFxVVZpNXuDb2ulO4BW9w2JJeNpo44oi30aOT4oHBKIow/exec",

  // The embed URL of your Google Form (Share > embed <> icon, or add
  // "?embedded=true" to the form's viewform URL).
  // Looks like: https://docs.google.com/forms/d/e/FORM_ID/viewform?embedded=true
  FORM_EMBED_URL: "https://docs.google.com/forms/d/e/1FAIpQLSeB1EGEIJWLTmBKdcUlnOrMPox-H6DxB0lCmzpfjkksMwj0AA/viewform?embedded=true",

  // The Google Drive folder to show as the photo gallery. This can be the same
  // folder your Form's file-upload question saves photos into.
  // Already set to the folder you shared.
  GALLERY_FOLDER_ID: "1JFQgdwwNkFyIpwiW0Tms1yI4EIadFwUZyQSUarJmJ5z8jEv7PhxEToKAmD8SLdd3JNf3f6Lr",
};
