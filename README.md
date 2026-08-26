# In Memory of Andrei Rogers — website

A static memorial site: an obituary page, a "Memories Wall" that lists
reflections from family and friends (searchable and filterable by date and
author), a submission form, a photo gallery, and a page for links to his
book and film.

No server or database to run — it's plain HTML/CSS/JS that you can host
anywhere (GitHub Pages, Netlify, Vercel, or even just open `index.html`
locally to preview).

## How it fits together

1. A **Google Form** collects reflections (name, email, relationship,
   memory, photos).
2. Responses land in a **Google Sheet**, which stays private.
3. A small **Google Apps Script**, deployed as a private Web App, reads
   that sheet and returns only the *approved* reflections as JSON — and
   never includes email addresses, even for approved ones.
4. The website's Memories Wall fetches that JSON and renders it, with
   client-side search/filter.
5. The **Photo Gallery** page embeds a Google Drive folder directly (the
   same folder your Form saves uploaded photos into).

This means submitted reflections don't show up publicly until you
explicitly mark them "Approved" in the sheet — no comment moderation
system to build, just a spreadsheet column.

## Setup steps

### 1. Create the Google Form

Create a new Google Form with these questions, in this order (matching
names makes the backend script work without edits):

1. **Your Name** — short answer, required
2. **Your Email** — short answer, required (used only for you to
   follow up if needed; it is never shown on the site)
3. **Your Relationship to Andrei (optional)** — short answer
4. **Your Memory or Reflection** — paragraph, required
5. **Photos (optional)** — file upload question (allow multiple files)

Note: Google Forms requires people to sign in with a Google account to
use a file-upload question. That's a Google limitation, not something
this site controls — the Share page mentions this and offers emailing
photos as a fallback.

### 2. Link the Form to a Sheet

In the Form editor, go to **Responses > the green Sheets icon** to
create a linked response spreadsheet.

### 3. Add an "Approved" column

In that spreadsheet, add a new column header in the first empty column:
`Approved`. Leave it blank for new submissions. When you've reviewed a
reflection and want it to go live, type `Yes` in that row's Approved
cell.

### 4. Add the backend script

1. In the spreadsheet, go to **Extensions > Apps Script**.
2. Delete the placeholder code and paste in the contents of
   [`apps-script/Code.gs`](apps-script/Code.gs) from this project.
3. Click **Deploy > New deployment**.
4. Choose type **Web app**.
5. Set "Execute as" to **Me**, and "Who has access" to **Anyone**.
6. Click **Deploy**, authorize it when prompted, and copy the resulting
   **Web app URL** (ends in `/exec`).

If your Form's question wording doesn't exactly match the headers above,
open `Code.gs` and adjust the `HEADER_*` constants near the top to match
your sheet's actual column headers.

### 5. Get your Drive folder ready

Google Forms automatically creates a Drive folder for uploaded photos
(named after your form). You've already shared one folder ID with this
project:

```
1dWhLnFOfEwsgRtZnSHVK6vigqHqqINir
```

Make sure that folder's sharing is set to **"Anyone with the link" —
Viewer** so the embedded gallery can display it. If your Form creates a
*different* folder automatically, either move photo uploads into this
one, or update `GALLERY_FOLDER_ID` in `assets/js/config.js` to the new
folder's ID (the long string in its Drive URL after `/folders/`).

### 6. Wire it all into the site

Open [`assets/js/config.js`](assets/js/config.js) and fill in:

```js
MEMORIES_API_URL: "https://script.google.com/macros/s/XXXXXXXX/exec",
FORM_EMBED_URL: "https://docs.google.com/forms/d/e/XXXXXXXX/viewform?embedded=true",
```

- `MEMORIES_API_URL` is the Web app URL from step 4.
- `FORM_EMBED_URL` is your Form's normal URL with `?embedded=true` added
  (or use the Form's **Send > embed `<>`** option and copy the `src`
  from the `<iframe>` it gives you).

### 7. Add the book & film links

When you have them, open `book-movies.html` near the bottom and set:

```js
const BOOK_URL = "https://...";
const FILM_URL = "https://...";
```

## Previewing locally

Just open `index.html` in a browser, or run a simple local server from
this folder:

```bash
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## Deploying

Any static host works. A couple of easy options:

- **GitHub Pages**: push this folder to a GitHub repo and enable Pages
  in the repo settings.
- **Netlify / Vercel**: drag-and-drop this folder onto their dashboard,
  or connect a git repo for automatic deploys.

No build step is required either way.
