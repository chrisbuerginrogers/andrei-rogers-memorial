// ============================================================
// Memories Wall — fetches approved reflections from the Apps
// Script backend and renders a searchable, filterable list.
// ============================================================
(function () {
  const listEl = document.getElementById("memories-list");
  const metaEl = document.getElementById("memories-meta");
  const searchInput = document.getElementById("filter-search");
  const authorInput = document.getElementById("filter-author");
  const fromInput = document.getElementById("filter-from");
  const toInput = document.getElementById("filter-to");
  const sortSelect = document.getElementById("filter-sort");
  const clearBtn = document.getElementById("filter-clear");

  let allMemories = [];

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  }

  function renderMemories(items) {
    if (!items.length) {
      listEl.innerHTML = '<div class="state-msg">No memories match your filters yet. Try widening your search.</div>';
      metaEl.textContent = "";
      return;
    }

    metaEl.textContent = `Showing ${items.length} memor${items.length === 1 ? "y" : "ies"}`;

    listEl.innerHTML = items.map(item => {
      const photosHtml = (item.photos || []).length
        ? `<div class="memory-photos">${item.photos.map(url =>
            `<a href="${escapeHtml(url)}" target="_blank" rel="noopener"><img src="${escapeHtml(toThumbnail(url))}" alt="Photo shared by ${escapeHtml(item.name)}" loading="lazy"></a>`
          ).join("")}</div>`
        : "";

      return `
        <article class="memory-card">
          <div class="memory-head">
            <div>
              <span class="memory-author">${escapeHtml(item.name || "Anonymous")}</span>
              ${item.relationship ? `<span class="memory-relationship"> · ${escapeHtml(item.relationship)}</span>` : ""}
            </div>
            <span class="memory-date">${formatDate(item.timestamp)}</span>
          </div>
          <p class="memory-text">${escapeHtml(item.reflection)}</p>
          ${photosHtml}
        </article>
      `;
    }).join("");
  }

  // Convert a Google Drive "file/d/<id>/view" link into a thumbnail image URL.
  function toThumbnail(url) {
    const match = String(url).match(/\/d\/([a-zA-Z0-9_-]+)/) || String(url).match(/id=([a-zA-Z0-9_-]+)/);
    if (match) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w400`;
    }
    return url;
  }

  function applyFilters() {
    const q = (searchInput.value || "").trim().toLowerCase();
    const author = (authorInput.value || "").trim().toLowerCase();
    const from = fromInput.value ? new Date(fromInput.value) : null;
    const to = toInput.value ? new Date(toInput.value) : null;
    if (to) to.setHours(23, 59, 59, 999);

    let filtered = allMemories.filter(item => {
      if (author && !(item.name || "").toLowerCase().includes(author)) return false;
      if (q) {
        const haystack = `${item.name || ""} ${item.reflection || ""} ${item.relationship || ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (from || to) {
        const d = new Date(item.timestamp);
        if (isNaN(d)) return false;
        if (from && d < from) return false;
        if (to && d > to) return false;
      }
      return true;
    });

    filtered.sort((a, b) => {
      const da = new Date(a.timestamp), db = new Date(b.timestamp);
      return sortSelect.value === "oldest" ? da - db : db - da;
    });

    renderMemories(filtered);
  }

  function showConfigNotice() {
    listEl.innerHTML = `
      <div class="notice">
        <strong>Almost there.</strong> The Memories Wall isn't connected yet. Set
        <code>MEMORIES_API_URL</code> in <code>assets/js/config.js</code> to your
        deployed Apps Script Web App URL — see the README for the full setup steps.
      </div>`;
    metaEl.textContent = "";
  }

  function init() {
    [searchInput, authorInput, fromInput, toInput].forEach(el =>
      el.addEventListener("input", applyFilters)
    );
    sortSelect.addEventListener("change", applyFilters);
    clearBtn.addEventListener("click", () => {
      searchInput.value = "";
      authorInput.value = "";
      fromInput.value = "";
      toInput.value = "";
      sortSelect.value = "newest";
      applyFilters();
    });

    const apiUrl = window.SITE_CONFIG && window.SITE_CONFIG.MEMORIES_API_URL;
    if (!apiUrl) {
      showConfigNotice();
      return;
    }

    listEl.innerHTML = '<div class="state-msg">Loading memories…</div>';

    fetch(apiUrl)
      .then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then(data => {
        allMemories = Array.isArray(data) ? data : (data.memories || []);
        applyFilters();
      })
      .catch(err => {
        console.error(err);
        listEl.innerHTML = '<div class="state-msg">We had trouble loading memories right now. Please try refreshing the page in a moment.</div>';
        metaEl.textContent = "";
      });
  }

  init();
})();
