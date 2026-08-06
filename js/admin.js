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
  const backdrop = document.getElementById("drawerBackdrop");
  const toast = document.getElementById("toast");
  const bulkBar = document.getElementById("bulkBar");

  let currentModalType = null;
  let editingId = null;
  let storeCache = { listings: [], complexes: [] };
  let selectedIds = new Set();
  let contactsCache = [];
  let statsCache = null;

  const viewTitles = {
    dashboard: "İcmal",
    listings: "Obyektlər",
    complexes: "Komplekslər",
    messages: "Müraciətlər",
    settings: "Ayarlar",
  };

  const typeLabels = { sale: "Satış", rent: "Kirayə", daily: "Günlük" };
  const statusLabels = { published: "Dərc", draft: "Qaralama", archived: "Arxiv" };
  const categoryLabels = {
    apartment: "Mənzil",
    house: "Ev/Villa",
    office: "Ofis",
    garage: "Qaraj",
    land: "Torpaq",
    commercial: "Obyekt",
    other: "Digər",
  };

  function showToast(msg) {
    toast.textContent = msg;
    toast.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => { toast.hidden = true; }, 2600);
  }

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

  async function refreshStats() {
    try {
      statsCache = await getAdminStats();
      updateUnreadBadge(statsCache.contacts?.unread || 0);
    } catch {
      statsCache = null;
    }
  }

  function updateUnreadBadge(n) {
    const badge = document.getElementById("navUnreadBadge");
    if (!badge) return;
    if (n > 0) {
      badge.hidden = false;
      badge.textContent = n > 99 ? "99+" : String(n);
    } else {
      badge.hidden = true;
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
      await refreshStats();
      if (view === "dashboard") renderDashboard();
      if (view === "listings") renderListings();
      if (view === "complexes") renderComplexes();
      if (view === "messages") await renderMessages();
      if (view === "settings") await renderSettings();
    } catch (err) {
      console.error(err);
      if (String(err.message).includes("Giriş") || String(err.message).includes("Sessiya")) {
        logout();
        return;
      }
      showToast(err.message || "Yükləmə xətası");
    }
  }

  document.querySelectorAll("[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => switchView(btn.dataset.view));
  });

  document.querySelectorAll("[data-goto]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const v = btn.dataset.goto;
      if (v === "listings" && btn.id === "quickAddListing") {
        switchView("listings").then(() => openListingModal());
      } else {
        switchView(v);
      }
    });
  });

  function updateBulkBar() {
    if (!bulkBar) return;
    if (selectedIds.size === 0) {
      bulkBar.hidden = true;
      return;
    }
    bulkBar.hidden = false;
    document.getElementById("bulkCount").textContent = `${selectedIds.size} seçildi`;
  }

  function bindItemActions(root) {
    root.querySelectorAll("[data-select-listing]").forEach((cb) => {
      cb.addEventListener("change", () => {
        const id = Number(cb.dataset.selectListing);
        if (cb.checked) selectedIds.add(id);
        else selectedIds.delete(id);
        updateBulkBar();
      });
    });
    root.querySelectorAll("[data-edit-listing]").forEach((btn) => {
      btn.addEventListener("click", () => openListingModal(Number(btn.dataset.editListing)));
    });
    root.querySelectorAll("[data-publish-listing]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        try {
          await toggleListingPublish(btn.dataset.publishListing);
          await refreshStore();
          await refreshStats();
          renderListings();
          renderDashboard();
          showToast("Status yeniləndi");
        } catch (err) {
          showToast(err.message || "Xəta");
        }
      });
    });
    root.querySelectorAll("[data-duplicate-listing]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        try {
          await duplicateListing(btn.dataset.duplicateListing);
          await refreshStore();
          renderListings();
          showToast("Obyekt kopyalandı (qaralama)");
        } catch (err) {
          showToast(err.message || "Xəta");
        }
      });
    });
    root.querySelectorAll("[data-delete-listing]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("Bu obyekti silmək istədiyinizə əminsiniz?")) return;
        try {
          await deleteListing(btn.dataset.deleteListing);
          selectedIds.delete(Number(btn.dataset.deleteListing));
          await refreshStore();
          await refreshStats();
          renderListings();
          renderDashboard();
          showToast("Silindi");
        } catch (err) {
          showToast(err.message || "Xəta");
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
          showToast("Kompleks silindi");
        } catch (err) {
          showToast(err.message || "Xəta");
        }
      });
    });
    root.querySelectorAll("[data-read-contact]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        try {
          await markContactRead(btn.dataset.readContact);
          await renderMessages();
          await refreshStats();
        } catch (err) {
          showToast(err.message || "Xəta");
        }
      });
    });
    root.querySelectorAll("[data-delete-contact]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("Müraciəti silmək?")) return;
        try {
          await deleteContact(btn.dataset.deleteContact);
          await renderMessages();
          await refreshStats();
          showToast("Silindi");
        } catch (err) {
          showToast(err.message || "Xəta");
        }
      });
    });
  }

  document.querySelectorAll("[data-bulk]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const action = btn.dataset.bulk;
      const ids = [...selectedIds];
      if (!ids.length) return;
      if (action === "delete" && !confirm(`${ids.length} obyekt silinsin?`)) return;
      try {
        await bulkListings(ids, action);
        selectedIds.clear();
        updateBulkBar();
        await refreshStore();
        await refreshStats();
        renderListings();
        renderDashboard();
        showToast("Toplu əməliyyat tamamlandı");
      } catch (err) {
        showToast(err.message || "Xəta");
      }
    });
  });

  function listingCard(l, { compact = false, selectable = false } = {}) {
    const checked = selectedIds.has(l.id) ? "checked" : "";
    const select = selectable
      ? `<label class="admin-item__check"><input type="checkbox" data-select-listing="${l.id}" ${checked}></label>`
      : "";
    const premium = l.premium ? '<span class="admin-badge admin-badge--premium">Premium</span>' : "";
    const actions = compact
      ? ""
      : `<div class="admin-item__actions">
          <button type="button" class="admin-action-btn admin-action-btn--publish" data-publish-listing="${l.id}">
            ${l.status === "published" ? "Gizlət" : "Dərc et"}
          </button>
          <button type="button" class="admin-action-btn" data-edit-listing="${l.id}">Redaktə</button>
          <button type="button" class="admin-action-btn" data-duplicate-listing="${l.id}">Kopyala</button>
          <button type="button" class="admin-action-btn admin-action-btn--danger" data-delete-listing="${l.id}">Sil</button>
        </div>`;

    return `
      <article class="admin-item">
        ${select}
        <img src="${l.image || ""}" alt="" class="admin-item__img" loading="lazy">
        <div class="admin-item__body">
          <div class="admin-item__top">
            <div class="admin-item__price">${formatPrice(l.price)}</div>
            <div class="admin-item__badges">
              <span class="admin-badge admin-badge--${l.status}">${statusLabels[l.status] || l.status}</span>
              ${premium}
            </div>
          </div>
          <p class="admin-item__meta">
            <strong>${l.location}</strong>
            · ${typeLabels[l.listingType] || "—"}
            · ${categoryLabels[l.category] || ""}
            · #${l.id}
            ${l.phone ? `· ${l.phone}` : ""}
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

  function contactCard(c) {
    const date = c.createdAt ? new Date(c.createdAt).toLocaleString("az-AZ") : "";
    return `
      <article class="admin-item admin-item--msg ${c.isRead ? "" : "admin-item--unread"}">
        <div class="admin-item__body" style="grid-column:1/-1">
          <div class="admin-item__top">
            <div class="admin-item__price">${c.fullName || "Adsız"}</div>
            ${c.isRead ? "" : '<span class="admin-badge admin-badge--published">Yeni</span>'}
          </div>
          <p class="admin-item__meta">
            <a href="tel:${c.phone}">${c.phone}</a>
            ${c.email ? ` · <a href="mailto:${c.email}">${c.email}</a>` : ""}
            ${c.listingId ? ` · Elan #${c.listingId}` : ""}
            · ${date}
          </p>
          <p class="admin-msg-text">${c.message || "—"}</p>
          <div class="admin-item__actions">
            ${c.isRead ? "" : `<button type="button" class="admin-action-btn" data-read-contact="${c.id}">Oxundu</button>`}
            <a class="admin-action-btn admin-action-btn--publish" href="tel:${c.phone}">Zəng et</a>
            <button type="button" class="admin-action-btn admin-action-btn--danger" data-delete-contact="${c.id}">Sil</button>
          </div>
        </div>
      </article>`;
  }

  function renderDashboard() {
    const s = statsCache?.listings;
    const store = storeCache;
    document.getElementById("statPublished").textContent = s?.published ?? store.listings.filter((l) => l.status === "published").length;
    document.getElementById("statDraft").textContent = s?.draft ?? store.listings.filter((l) => l.status === "draft").length;
    document.getElementById("statRent").textContent = s?.rent ?? store.listings.filter((l) => l.listingType === "rent").length;
    document.getElementById("statSale").textContent = s?.sale ?? store.listings.filter((l) => l.listingType === "sale").length;
    document.getElementById("statPremium").textContent = s?.premium ?? store.listings.filter((l) => l.premium).length;
    document.getElementById("statUnread").textContent = statsCache?.contacts?.unread ?? 0;

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
        String(l.id).includes(search) ||
        (l.phone && l.phone.includes(search)) ||
        (l.title && l.title.toLowerCase().includes(search));
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
      ? items.map((l) => listingCard(l, { selectable: true })).join("")
      : '<p class="admin-empty">Nəticə tapılmadı</p>';
    bindItemActions(list);
    updateBulkBar();
  }

  function renderComplexes() {
    const list = document.getElementById("complexesList");
    list.innerHTML = storeCache.complexes.length
      ? storeCache.complexes.map(complexCard).join("")
      : '<p class="admin-empty">Kompleks yoxdur</p>';
    bindItemActions(list);
  }

  async function renderMessages() {
    const list = document.getElementById("messagesList");
    try {
      contactsCache = await getContacts();
      list.innerHTML = contactsCache.length
        ? contactsCache.map(contactCard).join("")
        : '<p class="admin-empty">Müraciət yoxdur</p>';
      bindItemActions(list);
    } catch (err) {
      list.innerHTML = `<p class="admin-empty">${err.message || "Yüklənmədi"}</p>`;
    }
  }

  async function renderSettings() {
    try {
      const settings = await loadSettings();
      document.getElementById("set_site_name").value = settings.site_name || "";
      document.getElementById("set_contact_phone").value = settings.contact_phone || "";
      document.getElementById("set_contact_email").value = settings.contact_email || "";
      document.getElementById("set_default_city").value = settings.default_city || "";
    } catch (err) {
      showToast(err.message || "Ayarlar yüklənmədi");
    }
    try {
      const profile = await getAdminProfile();
      document.getElementById("prof_fullName").value = profile.fullName || "";
      document.getElementById("prof_email").value = profile.email || "";
    } catch {
      /* ignore */
    }
  }

  document.getElementById("settingsForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await persistSettings({
        site_name: document.getElementById("set_site_name").value.trim(),
        contact_phone: document.getElementById("set_contact_phone").value.trim(),
        contact_email: document.getElementById("set_contact_email").value.trim(),
        default_city: document.getElementById("set_default_city").value.trim(),
      });
      showToast("Ayarlar saxlanıldı");
    } catch (err) {
      showToast(err.message || "Xəta");
    }
  });

  document.getElementById("profileForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await updateAdminProfile({
        fullName: document.getElementById("prof_fullName").value.trim(),
        email: document.getElementById("prof_email").value.trim(),
      });
      showToast("Profil saxlanıldı");
    } catch (err) {
      showToast(err.message || "Xəta");
    }
  });

  document.getElementById("passwordForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await changeAdminPassword(fd.get("currentPassword"), fd.get("newPassword"));
      e.target.reset();
      showToast("Şifrə yeniləndi");
    } catch (err) {
      showToast(err.message || "Xəta");
    }
  });

  document.getElementById("markAllReadBtn")?.addEventListener("click", async () => {
    try {
      await markAllContactsRead();
      await renderMessages();
      await refreshStats();
      showToast("Hamısı oxundu");
    } catch (err) {
      showToast(err.message || "Xəta");
    }
  });

  document.getElementById("refreshMessagesBtn")?.addEventListener("click", () => renderMessages());

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
      <label class="admin-field">
        <span>Başlıq (ixtiyari)</span>
        <input type="text" name="title" value="${listing?.title || ""}" placeholder="Məs: Ağ şəhərdə 3 otaqlı">
      </label>
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
          <span>Kateqoriya</span>
          <select name="category">
            ${Object.entries(categoryLabels).map(([k, v]) =>
              `<option value="${k}" ${listing?.category === k ? "selected" : ""}>${v}</option>`
            ).join("")}
          </select>
        </label>
      </div>
      <div class="admin-field-row">
        <label class="admin-field">
          <span>Status</span>
          <select name="status" required>
            <option value="draft" ${(!listing || listing.status === "draft") ? "selected" : ""}>Qaralama</option>
            <option value="published" ${listing?.status === "published" ? "selected" : ""}>Dərc edilmiş</option>
          </select>
        </label>
        <label class="admin-field">
          <span>Telefon</span>
          <input type="tel" name="phone" placeholder="(012) 526-94-94" value="${listing?.phone || ""}">
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
        <input type="url" name="image" id="listingImageInput" required value="${listing?.image || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop"}">
      </label>
      <div class="admin-img-preview"><img id="listingImagePreview" src="${listing?.image || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop"}" alt=""></div>
      <label class="admin-field">
        <span>Təsvir</span>
        <textarea name="description" rows="3" placeholder="Obyekt haqqında...">${listing?.description || ""}</textarea>
      </label>
      <div class="admin-checkboxes">
        <label class="admin-checkbox">
          <input type="checkbox" name="premium" ${listing?.premium ? "checked" : ""}> Premium / Seçilmiş
        </label>
      </div>`;

    const imgInput = document.getElementById("listingImageInput");
    const imgPrev = document.getElementById("listingImagePreview");
    imgInput?.addEventListener("input", () => {
      if (imgPrev && imgInput.value) imgPrev.src = imgInput.value;
    });
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
          title: fd.get("title")?.trim() || undefined,
          price: fd.get("price").trim(),
          location: fd.get("location").trim(),
          listingType: fd.get("listingType"),
          category: fd.get("category") || "apartment",
          status,
          phone: fd.get("phone")?.trim() || undefined,
          rooms: fd.get("rooms") ? Number(fd.get("rooms")) : undefined,
          area: area || undefined,
          floor: fd.get("floor")?.trim() || undefined,
          image: fd.get("image").trim(),
          description: fd.get("description")?.trim() || undefined,
          premium: fd.get("premium") === "on",
          date: existing?.date || (status === "published" ? formatDateNow() : undefined),
        });
        await refreshStore();
        await refreshStats();
        renderListings();
        showToast("Obyekt saxlanıldı");
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
        showToast("Kompleks saxlanıldı");
      }

      renderDashboard();
      closeModal();
    } catch (err) {
      showToast(err.message || "Saxlama xətası");
    }
  });

  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("modalCancel").addEventListener("click", closeModal);
  document.querySelector(".admin-modal__overlay").addEventListener("click", closeModal);
  document.getElementById("addListingBtn").addEventListener("click", () => openListingModal());
  document.getElementById("addComplexBtn").addEventListener("click", () => openComplexModal());
  document.getElementById("listingSearch").addEventListener("input", renderListings);
  document.getElementById("listingFilter").addEventListener("change", renderListings);

  (async function init() {
    try {
      await refreshStore();
      await refreshStats();
      renderDashboard();
    } catch (err) {
      console.error(err);
      if (String(err.message).includes("Giriş") || String(err.message).includes("Sessiya")) {
        logout();
      }
    }
  })();
})();

function formatPrice(price) {
  if (String(price).includes("/")) {
    const [amount, period] = String(price).split("/");
    return `${amount} ₼/${period}`;
  }
  return `${price} ₼`;
}
