# In Memory of Andrei Rogers — website

A static memorial site: an obituary and life-timeline home page, a
"Memories Wall" that lists reflections from family and friends
(searchable and filterable by date and author, hidden behind a
collapsed toggle), a link to the Share a Memory form, a photo gallery,
and a page for his book.

No server or database to run — it's plain HTML/CSS/JS that you can host
anywhere (GitHub Pages, Netlify, Vercel, or even just open `index.html`
locally to preview).

## How it fits together

1. A **Google Form** collects reflections (name, email, relationship,
   memory). It deliberately has **no file-upload question** — Google
   Forms forces sign-in for the *entire* form when one is present, which
   is more friction than it's worth. Photos go by email instead (see
   below).
2. Responses land in a **Google Sheet**, which stays private.
3. A small **Google Apps Script**, deployed as a private Web App, reads
   that sheet and returns only the *approved* reflections as JSON — and
   never includes email addresses, even for approved ones. The same
   script also lists image files from a shared Drive folder (call it
   with `?type=photos`) for the Photo Gallery page.
4. The Memories Wall and Photo Gallery pages fetch that JSON client-side
   and render it — search/filter/sort for memories, a responsive grid
   for photos.
5. Anyone with photos to share emails them to the family, who drop them
   into the shared Drive folder. The gallery picks them up automatically
   — no re-deploy needed.

Submitted reflections don't show up publicly until you explicitly mark
them `Yes` in the sheet's **Approved** column — that's the whole
moderation system, no separate admin panel required.

## Setup steps

### 1. Create the Google Form

Create a new Google Form with these questions. The exact wording
doesn't matter as long as you update the `HEADER_*` constants at the
top of `apps-script/Code.gs` to match (the script compares header text
case- and whitespace-insensitively, but the words themselves must
match):

1. **Your name** — short answer, required
2. **Your email** — short answer, required (used only for you to
   follow up if needed; never shown on the site)
3. **Your relationship to Andrei** — short answer, optional
4. **A memory or reflection** — paragraph, required

Do **not** add a file-upload question — see above.

### 2. Link the Form to a Sheet

In the Form editor, go to **Responses > the green Sheets icon** to
create a linked response spreadsheet.

### 3. Add an "Approved" column

In that spreadsheet, add a new column header in the first empty column:
`Approved`. Leave it blank for new submissions. When you've reviewed a
reflection and want it to go live, type `Yes` in that row's Approved
cell.

### 4. Create (or reuse) a Drive folder for photos

Create a Google Drive folder to hold gallery photos. Set its sharing to
**"Anyone with the link" — Viewer**, so visitors' browsers can load the
thumbnails. Copy its folder ID from the URL (the string after
`/folders/`).

### 5. Add the backend script

1. In the spreadsheet, go to **Extensions > Apps Script**.
2. Delete the placeholder code and paste in the contents of
   [`apps-script/Code.gs`](apps-script/Code.gs) from this project.
3. Update the `HEADER_*` constants near the top to match your Form's
   actual question wording (see step 1), and set `PHOTOS_FOLDER_ID` to
   the Drive folder ID from step 4.
4. Click **Deploy > New deployment** (first time) — choose type **Web
   app**, set "Execute as" to **Me**, "Who has access" to **Anyone**,
   then **Deploy** and authorize it when prompted. Copy the **Web app
   URL** (ends in `/exec`).
5. The *first* time you add Drive access (or any time you add a new
   Google service to the script), you also need to manually authorize
   it: pick `listPhotos` from the function dropdown in the toolbar and
   click **Run** once, approving the permission prompt that appears.

**Whenever you edit the script afterward**, you must re-deploy for the
change to go live: **Deploy > Manage deployments > pencil icon**, then
— important — change the **Version** dropdown to **"New version"**
before clicking **Deploy**. Leaving it on the old version silently
keeps the old code running even though the edit is saved.

### 6. Wire it all into the site

Open [`assets/js/config.js`](assets/js/config.js) and fill in:

```js
MEMORIES_API_URL: "https://script.google.com/macros/s/XXXXXXXX/exec",
FORM_EMBED_URL: "https://docs.google.com/forms/d/e/XXXXXXXX/viewform",
```

- `MEMORIES_API_URL` is the Web app URL from step 5. It powers both the
  Memories Wall and the Photo Gallery.
- `FORM_EMBED_URL` is your Form's normal URL (the Share a Memory page
  opens it in a new tab; any `?embedded=true` suffix is stripped
  automatically if present).

### 7. Add the book link

Open `book-movies.html` near the bottom and set:

```js
const BOOK_URL = "https://...";
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

No build step is required either way. If you change `assets/css/style.css`,
bump the `?v=N` cache-buster on the stylesheet `<link>` in every HTML
page — Safari in particular can hold onto a stale cached copy otherwise.
