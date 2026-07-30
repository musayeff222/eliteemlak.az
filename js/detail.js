(function () {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const main = document.getElementById("detailMain");
  const bottomBar = document.getElementById("detailBottomBar");
  const bookmarkBtn = document.querySelector(".detail-bookmark");

  if (!id) {
    main.innerHTML = '<p class="detail-loading">Obyekt tapılmadı. <a href="index.html">Ana səhifəyə qayıt</a></p>';
    return;
  }

  const listing = getPublicListingById(id);
  if (!listing) {
    main.innerHTML = '<p class="detail-loading">Obyekt tapılmadı. <a href="index.html">Ana səhifəyə qayıt</a></p>';
    return;
  }

  document.title = `${formatPrice(listing.price)} - ${listing.location} | ELITE-EMLAK.AZ`;

  const tags = [];
  if (listing.listingType) {
    const labels = { sale: "Satış", rent: "Kirayə", daily: "Günlük" };
    tags.push(`<span class="detail-tag">${labels[listing.listingType]}</span>`);
  }
  (listing.tags || []).forEach((t) => tags.push(`<span class="detail-tag">${t}</span>`));
  if (listing.premium) tags.push('<span class="detail-tag">Premium</span>');

  const paramsHtml = [];
  if (listing.rooms) paramsHtml.push({ label: "Otaq sayı", value: listing.rooms });
  if (listing.area) paramsHtml.push({ label: "Sahə", value: `${listing.area}${typeof listing.area === "number" ? " m²" : ""}` });
  if (listing.floor) paramsHtml.push({ label: "Mərtəbə", value: listing.floor });

  main.innerHTML = `
    <div class="detail-gallery">
      <img src="${listing.image}" alt="" class="detail-gallery__main">
      <span class="detail-gallery__count">1 / 1</span>
    </div>
    <div class="detail-content">
      <h1 class="detail-price">${formatPrice(listing.price)}</h1>
      <p class="detail-location">${listing.location}</p>
      <p class="detail-specs">${formatSpecs(listing)}</p>
      <p class="detail-date">${listing.date}</p>
      ${tags.length ? `<div class="detail-tags">${tags.join("")}</div>` : ""}

      <section class="detail-section">
        <h2 class="detail-section__title">Parametrlər</h2>
        <div class="detail-params">
          ${paramsHtml.map((p) => `
            <div class="detail-param">
              <span class="detail-param__label">${p.label}</span>
              <span class="detail-param__value">${p.value}</span>
            </div>`).join("")}
        </div>
      </section>

      <section class="detail-section">
        <h2 class="detail-section__title">Təsvir</h2>
        <p class="detail-description">${listing.description || generateDescription(listing)}</p>
      </section>

      <section class="detail-section">
        <h2 class="detail-section__title">Satıcı</h2>
        <div class="detail-seller">
          <div class="detail-seller__avatar">E</div>
          <div>
          <p class="detail-seller__name">Elite Emlak</p>
            <p class="detail-seller__type">Rəsmi daşınmaz əmlak şirkəti</p>
          </div>
        </div>
      </section>
    </div>`;

  bottomBar.hidden = false;

  function generateDescription(listing) {
    const parts = [`${listing.location} ərazisində yerləşən daşınmaz əmlak.`];
    if (listing.rooms) parts.push(`${listing.rooms} otaqlı`);
    if (listing.area) parts.push(`${listing.area}${typeof listing.area === "number" ? " m²" : ""} sahə`);
    if (listing.floor) parts.push(`${listing.floor} mərtəbə`);
    parts.push("Ətraflı məlumat üçün zəng edin.");
    return parts.join(". ") + ".";
  }

  const bookmarks = new Set(JSON.parse(localStorage.getItem("bookmarks") || "[]"));
  if (bookmarks.has(Number(id))) {
    bookmarkBtn.classList.add("detail-bookmark--active");
    bookmarkBtn.querySelector("svg").setAttribute("fill", "currentColor");
  }

  bookmarkBtn.addEventListener("click", () => {
    const numId = Number(id);
    if (bookmarks.has(numId)) {
      bookmarks.delete(numId);
      bookmarkBtn.classList.remove("detail-bookmark--active");
      bookmarkBtn.querySelector("svg").setAttribute("fill", "none");
    } else {
      bookmarks.add(numId);
      bookmarkBtn.classList.add("detail-bookmark--active");
      bookmarkBtn.querySelector("svg").setAttribute("fill", "currentColor");
    }
    localStorage.setItem("bookmarks", JSON.stringify([...bookmarks]));
  });
})();
