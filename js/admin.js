(function () {
  if (!isAdminLoggedIn()) {
    window.location.replace("/admin-login");
    return;
  }

  const pageTitle = document.getElementById("pageTitle");
  const modal = document.getElementById("modal");
  const modalForm = document.getElementById("modalForm");
  const modalTitle = document.getElementById("modalTitle");
  const panel = document.getElementById("panelView");
  const sidebar = document.getElementById("adminSidebar");
  const backdrop = document.getElementById("drawerBackdrop");

  let currentModalType = null;
  let editingId = null;
  let storeCache = { listings: [], complexes: [] };

  const viewTitles = {
    dashboard: "İcmal",
    listings: "Obyektlər",
    complexes: "Komplekslər",
    settings: "Ayarlar",
  };

  const typeLabels = { sale: "Satış", rent: "Kirayə", daily: "Günlük" };
  const statusLabels = { published: "Dərc", draft: "Qaralama" };

  function closeMenu() {
    panel.classList.remove("admin-panel--menu-open");
    backdrop.hidden = true;
  }

  function openMenu() {
    panel.classList.add("admin-panel--menu-open");
    backdrop.hidden = false;
  }

  document.getElementById("menuBtn")?.addEventListener("click", () => {
    if (panel.classList.contains("admin-panel--menu-open")) closeMenu();
    else openMenu();
  });
  backdrop?.addEventListener("click", closeMenu);

  async function refreshStore() {
    storeCache = await getStore();
    return storeCache;
  }

  async function showPanel() {
    try {
      await refreshStore();
      renderDashboard();
    } catch (err) {
      console.error(err);
      if (String(err.message).includes("Giriş") || String(err.message).includes("Sessiya")) {
        adminLogout();
        window.location.replace("/admin-login");
      }
    }
  }

  function logout() {
    adminLogout();
    window.location.href = "/admin-login";
  }

  document.getElementById("logoutBtn")?.addEventListener("click", logout);
  document.getElementById("logoutBtnMobile")?.addEventListener("click", logout);

  async function switchView(view) {
    document.querySelectorAll(".admin-nav__item").forEach((b) => {
      b.classList.toggle("admin-nav__item--active", b.dataset.view === view);
    });
    document.querySelectorAll(".admin-tabbar__item").forEach((b) => {
      b.classList.toggle("admin-tabbar__item--active", b.dataset.view === view);
    });
    pageTitle.textContent = viewTitles[view] || view;
    document.querySelectorAll(".admin-view").forEach((v) => (v.hidden = true));
    document.getElementById(`view-${view}`).hidden = false;
    closeMenu();

    try {
      await refreshStore();
      if (view === "dashboard") renderDashboard();
      if (view === "listings") renderListings();
      if (view === "complexes") renderComplexes();
    } catch (err) {
      console.error(err);
      alert(err.message || "Yükləmə xətası");
    }
  }

  document.querySelectorAll("[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => switchView(btn.dataset.view));
  });

  function bindItemActions(root) {
    root.querySelectorAll("[data-edit-listing]").forEach((btn) => {
      btn.addEventListener("click", () => openListingModal(Number(btn.dataset.editListing)));
    });
    root.querySelectorAll("[data-publish-listing]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        try {
          await toggleListingPublish(btn.dataset.publishListing);
          await refreshStore();
          renderListings();
          renderDashboard();
        } catch (err) {
          alert(err.message || "Xəta");
        }
      });
    });
    root.querySelectorAll("[data-delete-listing]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("Bu obyekti silmək istədiyinizə əminsiniz?")) return;
        try {
          await deleteListing(btn.dataset.deleteListing);
          await refreshStore();
          renderListings();
          renderDashboard();
        } catch (err) {
          alert(err.message || "Xəta");
        }
      });
    });
    root.querySelectorAll("[data-edit-complex]").forEach((btn) => {
      btn.addEventListener("click", () => openComplexModal(Number(btn.dataset.editComplex)));
    });
    root.querySelectorAll("[data-delete-complex]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("Bu kompleksi silmək istədiyinizə əminsiniz?")) return;
        try {
          await deleteComplex(btn.dataset.deleteComplex);
          await refreshStore();
          renderComplexes();
        } catch (err) {
          alert(err.message || "Xəta");
        }
      });
    });
  }

  function listingCard(l, { compact = false } = {}) {
    const actions = compact
      ? ""
      : `<div class="admin-item__actions">
          <button type="button" class="admin-action-btn admin-action-btn--publish" data-publish-listing="${l.id}">
            ${l.status === "published" ? "Gizlət" : "Dərc et"}
          </button>
          <button type="button" class="admin-action-btn" data-edit-listing="${l.id}">Redaktə</button>
          <button type="button" class="admin-action-btn admin-action-btn--danger" data-delete-listing="${l.id}">Sil</button>
        </div>`;

    return `
      <article class="admin-item">
        <img src="${l.image || ""}" alt="" class="admin-item__img" loading="lazy">
        <div class="admin-item__body">
          <div class="admin-item__top">
            <div class="admin-item__price">${formatPrice(l.price)}</div>
            <span class="admin-badge admin-badge--${l.status}">${statusLabels[l.status] || l.status}</span>
          </div>
          <p class="admin-item__meta">
            <strong>${l.location}</strong>
            · ${typeLabels[l.listingType] || "—"}
            · #${l.id}
          </p>
          ${actions}
        </div>
      </article>`;
  }

  function complexCard(c) {
    return `
      <article class="admin-item">
        <img src="${c.image || ""}" alt="" class="admin-item__img" loading="lazy">
        <div class="admin-item__body">
          <div class="admin-item__top">
            <div class="admin-item__price">${c.name}</div>
          </div>
          <p class="admin-item__meta">${c.priceFrom} ₼-dən · ${c.location}<br>${c.deadline || ""}</p>
          <div class="admin-item__actions">
            <button type="button" class="admin-action-btn" data-edit-complex="${c.id}">Redaktə</button>
            <button type="button" class="admin-action-btn admin-action-btn--danger" data-delete-complex="${c.id}">Sil</button>
          </div>
        </div>
      </article>`;
  }

  function renderDashboard() {
    const store = storeCache;
    const published = store.listings.filter((l) => l.status === "published");
    const draft = store.listings.filter((l) => l.status === "draft");

    document.getElementById("statPublished").textContent = published.length;
    document.getElementById("statDraft").textContent = draft.length;
    document.getElementById("statRent").textContent = store.listings.filter((l) => l.listingType === "rent").length;
    document.getElementById("statSale").textContent = store.listings.filter((l) => l.listingType === "sale").length;

    const recent = document.getElementById("recentList");
    const items = store.listings.slice(0, 8);
    recent.innerHTML = items.length
      ? items.map((l) => listingCard(l, { compact: true })).join("")
      : '<p class="admin-empty">Hələ obyekt yoxdur</p>';
    bindItemActions(recent);
  }

  function getFilteredListings() {
    const search = document.getElementById("listingSearch")?.value.toLowerCase() || "";
    const filter = document.getElementById("listingFilter")?.value || "all";
    return storeCache.listings.filter((l) => {
      const matchSearch =
        !search ||
        l.location.toLowerCase().includes(search) ||
        String(l.price).includes(search) ||
        String(l.id).includes(search);
      const matchFilter =
        filter === "all" ||
        (filter === "draft" && l.status === "draft") ||
        (filter === "published" && l.status === "published") ||
        (filter === "sale" && l.listingType === "sale") ||
        (filter === "rent" && l.listingType === "rent") ||
        (filter === "daily" && l.listingType === "daily") ||
        (filter === "premium" && l.premium);
      return matchSearch && matchFilter;
    });
  }

  function renderListings() {
    const list = document.getElementById("listingsList");
    const items = getFilteredListings();
    list.innerHTML = items.length
      ? items.map((l) => listingCard(l)).join("")
      : '<p class="admin-empty">Nəticə tapılmadı</p>';
    bindItemActions(list);
  }

  function renderComplexes() {
    const list = document.getElementById("complexesList");
    list.innerHTML = storeCache.complexes.length
      ? storeCache.complexes.map(complexCard).join("")
      : '<p class="admin-empty">Kompleks yoxdur</p>';
    bindItemActions(list);
  }

  function openModal(title) {
    modalTitle.textContent = title;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    modalForm.innerHTML = "";
    currentModalType = null;
    editingId = null;
  }

  function openListingModal(id = null) {
    currentModalType = "listing";
    editingId = id;
    const listing = id ? storeCache.listings.find((l) => l.id === id) : null;
    openModal(id ? "Obyekti redaktə et" : "Yeni obyekt");

    modalForm.innerHTML = `
      <div class="admin-field-row">
        <label class="admin-field">
          <span>Qiymət</span>
          <input type="text" name="price" required placeholder="153 900 və ya 2 200/ay" value="${listing?.price || ""}">
        </label>
        <label class="admin-field">
          <span>Yer / Rayon</span>
          <input type="text" name="location" required value="${listing?.location || ""}">
        </label>
      </div>
      <div class="admin-field-row">
        <label class="admin-field">
          <span>Elan növü</span>
          <select name="listingType" required>
            <option value="sale" ${listing?.listingType === "sale" ? "selected" : ""}>Satış</option>
            <option value="rent" ${listing?.listingType === "rent" ? "selected" : ""}>Kirayə</option>
            <option value="daily" ${listing?.listingType === "daily" ? "selected" : ""}>Günlük</option>
          </select>
        </label>
        <label class="admin-field">
          <span>Status</span>
          <select name="status" required>
            <option value="draft" ${(!listing || listing.status === "draft") ? "selected" : ""}>Qaralama</option>
            <option value="published" ${listing?.status === "published" ? "selected" : ""}>Dərc edilmiş</option>
          </select>
        </label>
      </div>
      <div class="admin-field-row">
        <label class="admin-field">
          <span>Otaq sayı</span>
          <input type="number" name="rooms" min="0" inputmode="numeric" value="${listing?.rooms ?? ""}">
        </label>
        <label class="admin-field">
          <span>Sahə (m² və ya 8 sot)</span>
          <input type="text" name="area" value="${listing?.area ?? ""}">
        </label>
      </div>
      <label class="admin-field">
        <span>Mərtəbə</span>
        <input type="text" name="floor" placeholder="5/8" value="${listing?.floor || ""}">
      </label>
      <label class="admin-field">
        <span>Şəkil URL</span>
        <input type="url" name="image" required value="${listing?.image || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop"}">
      </label>
      <label class="admin-field">
        <span>Təsvir</span>
        <textarea name="description" rows="3" placeholder="Obyekt haqqında...">${listing?.description || ""}</textarea>
      </label>
      <div class="admin-checkboxes">
        <label class="admin-checkbox">
          <input type="checkbox" name="premium" ${listing?.premium ? "checked" : ""}> Premium / Seçilmiş
        </label>
      </div>`;
  }

  function openComplexModal(id = null) {
    currentModalType = "complex";
    editingId = id;
    const complex = id ? storeCache.complexes.find((c) => c.id === id) : null;
    openModal(id ? "Kompleksi redaktə et" : "Yeni kompleks");

    modalForm.innerHTML = `
      <label class="admin-field">
        <span>Ad</span>
        <input type="text" name="name" required value="${complex?.name || ""}">
      </label>
      <div class="admin-field-row">
        <label class="admin-field">
          <span>Qiymət (₼-dən)</span>
          <input type="text" name="priceFrom" required value="${complex?.priceFrom || ""}">
        </label>
        <label class="admin-field">
          <span>Təhvil tarixi</span>
          <input type="text" name="deadline" required value="${complex?.deadline || ""}">
        </label>
      </div>
      <label class="admin-field">
        <span>Yer</span>
        <input type="text" name="location" required value="${complex?.location || ""}">
      </label>
      <label class="admin-field">
        <span>Developer (ixtiyari)</span>
        <input type="text" name="developer" value="${complex?.developer || ""}">
      </label>
      <label class="admin-field">
        <span>Şəkil URL</span>
        <input type="url" name="image" required value="${complex?.image || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop"}">
      </label>`;
  }

  modalForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(modalForm);

    try {
      if (currentModalType === "listing") {
        const areaVal = fd.get("area");
        let area = areaVal;
        if (areaVal && !isNaN(areaVal) && !String(areaVal).includes("sot")) {
          area = Number(areaVal);
        }

        const status = fd.get("status");
        const existing = editingId
          ? storeCache.listings.find((l) => l.id === editingId)
          : null;

        await upsertListing({
          id: editingId || undefined,
          price: fd.get("price").trim(),
          location: fd.get("location").trim(),
          listingType: fd.get("listingType"),
          status,
          rooms: fd.get("rooms") ? Number(fd.get("rooms")) : undefined,
          area: area || undefined,
          floor: fd.get("floor")?.trim() || undefined,
          image: fd.get("image").trim(),
          description: fd.get("description")?.trim() || undefined,
          premium: fd.get("premium") === "on",
          date: existing?.date || (status === "published" ? formatDateNow() : undefined),
        });
        await refreshStore();
        renderListings();
      }

      if (currentModalType === "complex") {
        await upsertComplex({
          id: editingId || undefined,
          name: fd.get("name").trim(),
          priceFrom: fd.get("priceFrom").trim(),
          location: fd.get("location").trim(),
          deadline: fd.get("deadline").trim(),
          image: fd.get("image").trim(),
          developer: fd.get("developer")?.trim() || undefined,
        });
        await refreshStore();
        renderComplexes();
      }

      renderDashboard();
      closeModal();
    } catch (err) {
      alert(err.message || "Saxlama xətası");
    }
  });

  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("modalCancel").addEventListener("click", closeModal);
  document.querySelector(".admin-modal__overlay").addEventListener("click", closeModal);
  document.getElementById("addListingBtn").addEventListener("click", () => openListingModal());
  document.getElementById("addComplexBtn").addEventListener("click", () => openComplexModal());
  document.getElementById("listingSearch").addEventListener("input", renderListings);
  document.getElementById("listingFilter").addEventListener("change", renderListings);

  document.getElementById("resetDataBtn").addEventListener("click", () => {
    alert("Məlumatlar MySQL-dədir. İlkin data üçün Hostinger-də app restart edin (auto-migrate) və ya schema.sql import edin.");
  });

  showPanel();
})();

function formatPrice(price) {
  if (String(price).includes("/")) {
    const [amount, period] = String(price).split("/");
    return `${amount} ₼/${period}`;
  }
  return `${price} ₼`;
}
