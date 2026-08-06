(function () {
  const bookmarks = new Set(JSON.parse(localStorage.getItem("bookmarks") || "[]"));

  const CATEGORY_ICONS = {
    "building-new": '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="2" width="16" height="20" rx="1"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/><line x1="9" y1="18" x2="15" y2="18"/></svg>',
    house: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    office: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="20" height="14" rx="1"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>',
    garage: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="8" width="20" height="14" rx="1"/><path d="M6 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/></svg>',
    land: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    commercial: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
  };

  const FILTER_OPTIONS = {
    type: [
      { label: "Alış", value: "sale" },
      { label: "Kirayə", value: "rent" },
      { label: "Günlük", value: "daily" },
    ],
    category: CATEGORIES.map((c) => ({ label: c.name, value: c.id })),
    rooms: [
      { label: "1 otaq", value: "1" },
      { label: "2 otaq", value: "2" },
      { label: "3 otaq", value: "3" },
      { label: "4 otaq", value: "4" },
      { label: "5+ otaq", value: "5+" },
    ],
    price: [
      { label: "50 000-ə qədər", value: "0-50000" },
      { label: "50 000 - 100 000", value: "50000-100000" },
      { label: "100 000 - 200 000", value: "100000-200000" },
      { label: "200 000 - 500 000", value: "200000-500000" },
      { label: "500 000+", value: "500000-" },
    ],
  };

  const filters = {
    listingType: null,
    category: null,
    rooms: null,
    price: null,
    q: "",
  };

  let allListings = [];

  function listingPriceNum(listing) {
    return Number(String(listing.price || "").split("/")[0].replace(/\s/g, "").replace(",", ".")) || 0;
  }

  function matchesPrice(listing, range) {
    if (!range) return true;
    const [minS, maxS] = String(range).split("-");
    const min = minS === "" ? 0 : Number(minS);
    const max = maxS === "" || maxS == null ? Infinity : Number(maxS);
    const n = listingPriceNum(listing);
    return n >= min && n <= max;
  }

  function matchesRooms(listing, rooms) {
    if (!rooms) return true;
    const r = Number(listing.rooms) || 0;
    if (rooms === "5+") return r >= 5;
    return r === Number(rooms);
  }

  function getFilteredListings(list = allListings) {
    const q = (filters.q || "").trim().toLowerCase();
    return list.filter((l) => {
      if (filters.listingType && l.listingType !== filters.listingType) return false;
      if (filters.category && l.category !== filters.category) return false;
      if (!matchesRooms(l, filters.rooms)) return false;
      if (!matchesPrice(l, filters.price)) return false;
      if (q) {
        const hay = `${l.location || ""} ${l.city || ""} ${l.title || ""} ${l.district || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function updateListingsTitle() {
    const el = document.getElementById("listingsTitle");
    if (!el) return;
    const parts = [];
    if (filters.listingType === "sale") parts.push("satış");
    if (filters.listingType === "rent") parts.push("kirayə");
    if (filters.listingType === "daily") parts.push("günlük");
    if (filters.category && CATEGORY_LABELS[filters.category]) {
      parts.push(CATEGORY_LABELS[filters.category].toLowerCase());
    }
    el.textContent = parts.length
      ? `ELITE-EMLAK.AZ — ${parts.join(" · ")}`
      : "ELITE-EMLAK.AZ — satış və kirayə obyektləri";
  }

  function createBookmarkBtn(id) {
    const active = bookmarks.has(id);
    return `<button class="card__bookmark${active ? " card__bookmark--active" : ""}" data-id="${id}" aria-label="Add ad ${id} to bookmark">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="${active ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.5">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </button>`;
  }

  function createListingCard(listing, variant = "grid") {
    const specs = formatSpecs(listing);
    const tags = (listing.tags || [])
      .map((t) => `<span class="card__tag">${t}</span>`)
      .join("");
    const typeLabels = { sale: "Satış", rent: "Kirayə", daily: "Günlük" };
    const catLabel = CATEGORY_LABELS[listing.category]
      ? `<span class="card__badge card__badge--cat">${CATEGORY_LABELS[listing.category]}</span>`
      : "";
    const typeBadge = listing.listingType
      ? `<span class="card__badge card__badge--type">${typeLabels[listing.listingType] || ""}</span>`
      : "";
    const premiumIcon = listing.premium
      ? '<span class="card__premium"><svg width="14" height="14" viewBox="0 0 24 24" fill="#af8329"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></span>'
      : "";

    return `
      <a href="/elan.html?id=${listing.id}" class="card card--${variant}" data-id="${listing.id}">
        <div class="card__image-wrap">
          <img src="${listing.image}" alt="" class="card__image" loading="lazy">
          ${typeBadge}
          ${catLabel}
          ${createBookmarkBtn(listing.id)}
        </div>
        <div class="card__body">
          <div class="card__price-row">
            <span class="card__price">${formatPrice(listing.price)}</span>
            <span class="card__verified">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#3db460"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            </span>
          </div>
          ${tags ? `<div class="card__tags">${tags}</div>` : ""}
          <p class="card__location">${listing.location}</p>
          ${specs ? `<p class="card__specs">${specs}</p>` : ""}
          <p class="card__date">${listing.date || ""}</p>
          ${premiumIcon}
        </div>
      </a>`;
  }

  function createComplexCard(complex) {
    return `
      <a href="#" class="complex-card">
        <div class="complex-card__image-wrap">
          <img src="${complex.image}" alt="${complex.name}" class="complex-card__image" loading="lazy">
          <div class="complex-card__overlay">
            <h3 class="complex-card__name">${complex.name}</h3>
          </div>
        </div>
        <div class="complex-card__body">
          <h2 class="complex-card__price">${complex.priceFrom} ₼-dən</h2>
          <h3 class="complex-card__title">${complex.name}</h3>
          ${complex.developer ? `<p class="complex-card__developer">${complex.developer}</p>` : ""}
          <p class="complex-card__location">${complex.location}</p>
          <p class="complex-card__deadline">${complex.deadline}</p>
        </div>
      </a>`;
  }

  function syncCategoryPills() {
    document.querySelectorAll(".category-pill").forEach((btn) => {
      btn.classList.toggle("category-pill--active", btn.dataset.category === filters.category);
    });
  }

  function syncTypeNav() {
    document.querySelectorAll("[data-filter-type]").forEach((a) => {
      const v = a.dataset.filterType;
      const active = v === "" ? !filters.listingType : filters.listingType === v;
      a.classList.toggle("header__nav-link--active", active);
    });
  }

  function syncSelectButtons() {
    const typeBtn = document.querySelector('[data-select="type"]');
    const catBtn = document.querySelector('[data-select="category"]');
    const roomsBtn = document.querySelector('[data-select="rooms"]');
    const priceBtn = document.querySelector('[data-select="price"]');
    if (typeBtn) {
      const opt = FILTER_OPTIONS.type.find((o) => o.value === filters.listingType);
      typeBtn.textContent = opt?.label || "Növ";
    }
    if (catBtn) {
      const opt = FILTER_OPTIONS.category.find((o) => o.value === filters.category);
      catBtn.textContent = opt?.label || "Kateqoriya";
    }
    if (roomsBtn) {
      const opt = FILTER_OPTIONS.rooms.find((o) => o.value === filters.rooms);
      roomsBtn.textContent = opt?.label || "Otaq sayı";
    }
    if (priceBtn) {
      const opt = FILTER_OPTIONS.price.find((o) => o.value === filters.price);
      priceBtn.textContent = opt?.label || "Qiymət, ₼";
    }
  }

  async function renderCategories() {
    document.getElementById("categories").innerHTML = CATEGORIES.map(
      (c) =>
        `<button type="button" class="category-pill" data-category="${c.id}"><span class="category-pill__icon">${CATEGORY_ICONS[c.icon] || ""}</span>${c.name}</button>`
    ).join("");

    document.getElementById("categories").addEventListener("click", (e) => {
      const btn = e.target.closest(".category-pill");
      if (!btn) return;
      const id = btn.dataset.category;
      filters.category = filters.category === id ? null : id;
      syncCategoryPills();
      syncSelectButtons();
      renderListings();
      document.getElementById("listings")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    const todayEl = document.getElementById("todayCount");
    if (todayEl) {
      try {
        todayEl.textContent = await getActiveListingCount();
      } catch {
        todayEl.textContent = "0";
      }
    }
  }

  async function renderComplexes() {
    const el = document.getElementById("complexesGrid");
    try {
      const items = await getResidentialComplexes();
      el.innerHTML = items.map(createComplexCard).join("");
    } catch (err) {
      el.innerHTML = `<p class="detail-loading">Komplekslər yüklənmədi.</p>`;
      console.error(err);
    }
  }

  async function renderAgencies() {
    const el = document.getElementById("agenciesSlider");
    try {
      const items = await getAgencyListings();
      el.innerHTML = items.map((l) => createListingCard(l, "slider")).join("");
    } catch (err) {
      el.innerHTML = "";
      console.error(err);
    }
  }

  function renderListings() {
    const el = document.getElementById("listingsGrid");
    if (!el) return;
    updateListingsTitle();
    syncCategoryPills();
    syncTypeNav();
    const items = getFilteredListings();
    if (!items.length) {
      el.innerHTML = `<p class="listings-empty">Bu filtrə uyğun elan tapılmadı. Başqa kateqoriya və ya növ seçin.</p>`;
      return;
    }
    el.innerHTML = items.map((l) => createListingCard(l, "grid")).join("");
  }

  async function loadListings() {
    const el = document.getElementById("listingsGrid");
    try {
      allListings = await getAllListings();
      renderListings();
    } catch (err) {
      if (el) el.innerHTML = `<p class="detail-loading">Elanlar yüklənmədi. MySQL və API-ni yoxlayın.</p>`;
      console.error(err);
    }
  }

  function renderPopular() {
    document.getElementById("popularList").innerHTML = POPULAR_SEARCHES.map(
      (s) => `<li><a href="#" data-popular="${s}">${s}</a></li>`
    ).join("");
    document.getElementById("popularList")?.addEventListener("click", (e) => {
      const a = e.target.closest("[data-popular]");
      if (!a) return;
      e.preventDefault();
      filters.q = a.dataset.popular;
      const input = document.querySelector(".search-bar__input");
      if (input) input.value = filters.q;
      renderListings();
      document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" });
    });
  }

  function renderFooterTags() {
    document.getElementById("bakuDistricts").innerHTML = BAKU_DISTRICTS.map(
      (d) => `<a href="#" class="footer__tag" data-place="${d}">${d}</a>`
    ).join("");
    document.getElementById("azerbaijanCities").innerHTML = AZERBAIJAN_CITIES.map(
      (c) => `<a href="#" class="footer__tag" data-place="${c}">${c}</a>`
    ).join("");
    document.body.addEventListener("click", (e) => {
      const a = e.target.closest(".footer__tag[data-place]");
      if (!a) return;
      e.preventDefault();
      filters.q = a.dataset.place;
      const input = document.querySelector(".search-bar__input");
      if (input) input.value = filters.q;
      renderListings();
      document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" });
    });
  }

  function initSlider() {
    const track = document.getElementById("agenciesSlider");
    const prevBtn = document.querySelector('[data-slider="agencies"].slider-btn--prev');
    const nextBtn = document.querySelector('[data-slider="agencies"].slider-btn--next');
    if (!track || !prevBtn || !nextBtn) return;

    let offset = 0;
    const gap = 10;

    function getStep() {
      const card = track.querySelector(".card");
      return card ? card.offsetWidth + gap : 280;
    }

    function update() {
      const maxOffset = Math.max(0, track.scrollWidth - track.parentElement.clientWidth);
      offset = Math.max(0, Math.min(offset, maxOffset));
      track.style.transform = `translateX(-${offset}px)`;
      prevBtn.disabled = offset <= 0;
      nextBtn.disabled = offset >= maxOffset - 1;
    }

    prevBtn.addEventListener("click", () => {
      offset -= getStep() * 2;
      update();
    });
    nextBtn.addEventListener("click", () => {
      offset += getStep() * 2;
      update();
    });

    window.addEventListener("resize", update);
    update();
  }

  function initBookmarks() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".card__bookmark");
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      const id = Number(btn.dataset.id);
      if (bookmarks.has(id)) {
        bookmarks.delete(id);
        btn.classList.remove("card__bookmark--active");
        btn.querySelector("svg").setAttribute("fill", "none");
      } else {
        bookmarks.add(id);
        btn.classList.add("card__bookmark--active");
        btn.querySelector("svg").setAttribute("fill", "currentColor");
      }
      localStorage.setItem("bookmarks", JSON.stringify([...bookmarks]));
    });
  }

  function initSideMenu() {
    const menu = document.getElementById("sideMenu");
    const burger = document.querySelector(".header__burger");
    const close = document.querySelector(".side-menu__close");
    const overlay = document.querySelector(".side-menu__overlay");

    function open() {
      menu.classList.add("side-menu--open");
      document.body.style.overflow = "hidden";
    }
    function closeMenu() {
      menu.classList.remove("side-menu--open");
      document.body.style.overflow = "";
    }

    burger?.addEventListener("click", open);
    close?.addEventListener("click", closeMenu);
    overlay?.addEventListener("click", closeMenu);
    document.querySelector("#mobileMenuBtn, .mobile-nav__item:last-child")?.addEventListener("click", (e) => {
      e.preventDefault();
      open();
    });
  }

  function applySearchFromBar() {
    const input = document.querySelector(".search-bar__input");
    filters.q = input?.value.trim() || "";
    renderListings();
    document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" });
  }

  function initSearch() {
    document.querySelector(".search-bar__submit")?.addEventListener("click", applySearchFromBar);
    document.querySelector(".search-bar__input")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        applySearchFromBar();
      }
    });
  }

  function initDropdowns() {
    document.querySelectorAll(".select-btn").forEach((btn) => {
      const key = btn.dataset.select;
      const options = FILTER_OPTIONS[key];
      if (!options) return;

      const wrapper = btn.closest(".search-bar__select");
      wrapper.classList.add("select-wrapper");
      wrapper.insertAdjacentHTML(
        "beforeend",
        `<ul class="select-dropdown">${options
          .map((o) => `<li><button type="button" data-value="${o.value}">${o.label}</button></li>`)
          .join("")}</ul>`
      );

      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        document.querySelectorAll(".select-wrapper--open").forEach((w) => {
          if (w !== wrapper) w.classList.remove("select-wrapper--open");
        });
        wrapper.classList.toggle("select-wrapper--open");
      });

      wrapper.querySelectorAll(".select-dropdown button").forEach((opt) => {
        opt.addEventListener("click", () => {
          const value = opt.dataset.value;
          btn.textContent = opt.textContent;
          wrapper.classList.remove("select-wrapper--open");
          if (key === "type") filters.listingType = value;
          if (key === "category") filters.category = value;
          if (key === "rooms") filters.rooms = value;
          if (key === "price") filters.price = value;
          syncCategoryPills();
          syncTypeNav();
        });
      });
    });

    document.addEventListener("click", () => {
      document.querySelectorAll(".select-wrapper--open").forEach((w) => w.classList.remove("select-wrapper--open"));
    });
  }

  function initTypeNav() {
    document.querySelectorAll("[data-filter-type]").forEach((a) => {
      a.addEventListener("click", (e) => {
        const type = a.dataset.filterType;
        if (a.getAttribute("href")?.startsWith("#") && type === undefined) return;
        e.preventDefault();
        filters.listingType = type === "" ? null : type;
        syncSelectButtons();
        syncTypeNav();
        renderListings();
        if (a.getAttribute("href") === "#complexes") {
          document.getElementById("complexes")?.scrollIntoView({ behavior: "smooth" });
        } else {
          document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" });
        }
      });
    });
  }

  function initFloatingFilter() {
    const fab = document.querySelector(".floating-filter");
    fab?.addEventListener("click", () => {
      document.querySelector(".search-bar__filters-btn")?.click();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function initLeadForm() {
    const form = document.getElementById("leadForm");
    const status = document.getElementById("leadStatus");
    if (!form) return;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      try {
        await submitContact({
          fullName: fd.get("fullName")?.trim() || undefined,
          phone: fd.get("phone")?.trim(),
          message: fd.get("message")?.trim() || undefined,
        });
        form.reset();
        if (status) {
          status.hidden = false;
          status.textContent = "Müraciətiniz qəbul olundu. Tezliklə əlaqə saxlayacağıq.";
        }
      } catch (err) {
        if (status) {
          status.hidden = false;
          status.textContent = err.message || "Göndərmə alınmadı";
        }
      }
    });
  }

  function readUrlFilters() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("category")) filters.category = params.get("category");
    if (params.get("type")) filters.listingType = params.get("type");
    if (params.get("q")) filters.q = params.get("q");
  }

  async function init() {
    readUrlFilters();
    renderPopular();
    renderFooterTags();
    initBookmarks();
    initSideMenu();
    initSearch();
    initDropdowns();
    initTypeNav();
    initFloatingFilter();
    initLeadForm();
    syncSelectButtons();

    await Promise.all([renderCategories(), renderComplexes(), renderAgencies(), loadListings()]);
    syncCategoryPills();
    initSlider();
  }

  init().catch((err) => console.error(err));
})();
