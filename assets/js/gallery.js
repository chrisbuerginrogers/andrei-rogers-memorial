// ============================================================
// Photo Gallery — fetches image files from the shared Drive
// folder (via the Apps Script backend) and renders a grid.
// ============================================================
(function () {
  const gridEl = document.getElementById("photo-grid");
  const noticeEl = document.getElementById("gallery-notice");

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  function render(photos) {
    if (!photos.length) {
      gridEl.innerHTML = '<div class="state-msg">No photos yet — be the first to add one from the Share a Memory page.</div>';
      return;
    }
    gridEl.innerHTML = photos.map(p => `
      <a class="photo-tile" href="${escapeHtml(p.viewUrl)}" target="_blank" rel="noopener">
        <img src="${escapeHtml(p.thumbnail)}" alt="${escapeHtml(p.name)}" loading="lazy">
      </a>
    `).join("");
  }

  function init() {
    const apiUrl = window.SITE_CONFIG && window.SITE_CONFIG.MEMORIES_API_URL;
    if (!apiUrl) {
      gridEl.innerHTML = "";
      noticeEl.style.display = "block";
      return;
    }

    fetch(apiUrl + "?type=photos")
      .then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then(render)
      .catch(err => {
        console.error(err);
        gridEl.innerHTML = '<div class="state-msg">We had trouble loading photos right now. Please try refreshing the page in a moment.</div>';
      });
  }

  init();
})();
