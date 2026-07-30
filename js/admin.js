(function () {
  if (!isAdminLoggedIn()) {
    window.location.replace("/admin-login");
    return;
  }

  const pageTitle = document.getElementById("pageTitle");
  const modal = document.getElementById("modal");
  const modalForm = document.getElementById("modalForm");
  const modalTitle = document.getElementById("modalTitle");

  let currentModalType = null;
  let editingId = null;

  const viewTitles = {
    dashboard: "Dashboard",
    listings: "Obyektlər",
    complexes: "Komplekslər",
    settings: "Tənzimləmələr",
  };

  const typeLabels = { sale: "Satış", rent: "Kirayə", daily: "Günlük" };
  const statusLabels = { published: "Dərc", draft: "Qaralama" };

  showPanel();

  document.getElementById("logoutBtn").addEventListener("click", () => {
    adminLogout();
    window.location.href = "/admin-login";
  });

  document.querySelectorAll(".admin-nav__item").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".admin-nav__item").forEach((b) => b.classList.remove("admin-nav__item--active"));
      btn.classList.add("admin-nav__item--active");
      const view = btn.dataset.view;
      pageTitle.textContent = viewTitles[view];
      document.querySelectorAll(".admin-view").forEach((v) => (v.hidden = true));
      document.getElementById(`view-${view}`).hidden = false;
      if (view === "dashboard") renderDashboard();
      if (view === "listings") renderListings();
      if (view === "complexes") renderComplexes();
    });
  });

  function showPanel() {
    renderDashboard();
  }

  function renderDashboard() {
    const store = getStore();
    const published = store.listings.filter((l) => l.status === "published");
    const draft = store.listings.filter((l) => l.status === "draft");

    document.getElementById("statPublished").textContent = published.length;
    document.getElementById("statDraft").textContent = draft.length;
    document.getElementById("statRent").textContent = store.listings.filter((l) => l.listingType === "rent").length;
    document.getElementById("statSale").textContent = store.listings.filter((l) => l.listingType === "sale").length;

    document.querySelector("#recentTable tbody").innerHTML = store.listings.slice(0, 8).map((l) => `
      <tr>
        <td>${l.id}</td>
        <td>${formatPrice(l.price)}</td>
        <td>${l.location}</td>
        <td><span class="admin-badge admin-badge--${l.status}">${statusLabels[l.status]}</span></td>
      </tr>`).join("");
  }

  function getFilteredListings() {
    const search = document.getElementById("listingSearch")?.value.toLowerCase() || "";
    const filter = document.getElementById("listingFilter")?.value || "all";
    return getStore().listings.filter((l) => {
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
    const tbody = document.getElementById("listingsTableBody");
    tbody.innerHTML = getFilteredListings().map((l) => `
      <tr>
        <td><img src="${l.image}" alt="" class="admin-table__img"></td>
        <td>${l.id}</td>
        <td><strong>${formatPrice(l.price)}</strong></td>
        <td>${l.location}</td>
        <td>${typeLabels[l.listingType] || "—"}</td>
        <td><span class="admin-badge admin-badge--${l.status}">${statusLabels[l.status]}</span></td>
        <td>
          <div class="admin-actions">
            <button class="admin-action-btn admin-action-btn--publish" data-publish-listing="${l.id}">
              ${l.status === "published" ? "Gizlət" : "Dərc et"}
            </button>
            <button class="admin-action-btn" data-edit-listing="${l.id}">Redaktə</button>
            <button class="admin-action-btn admin-action-btn--danger" data-delete-listing="${l.id}">Sil</button>
          </div>
        </td>
      </tr>`).join("");

    tbody.querySelectorAll("[data-edit-listing]").forEach((btn) => {
      btn.addEventListener("click", () => openListingModal(Number(btn.dataset.editListing)));
    });
    tbody.querySelectorAll("[data-publish-listing]").forEach((btn) => {
      btn.addEventListener("click", () => {
        toggleListingPublish(btn.dataset.publishListing);
        renderListings();
        renderDashboard();
      });
    });
    tbody.querySelectorAll("[data-delete-listing]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (confirm("Bu obyekti silmək istədiyinizə əminsiniz?")) {
          deleteListing(btn.dataset.deleteListing);
          renderListings();
          renderDashboard();
        }
      });
    });
  }

  function renderComplexes() {
    const tbody = document.getElementById("complexesTableBody");
    tbody.innerHTML = getStore().complexes.map((c) => `
      <tr>
        <td><img src="${c.image}" alt="" class="admin-table__img"></td>
        <td><strong>${c.name}</strong></td>
        <td>${c.priceFrom} ₼-dən</td>
        <td>${c.location}</td>
        <td>${c.deadline}</td>
        <td>
          <div class="admin-actions">
            <button class="admin-action-btn" data-edit-complex="${c.id}">Redaktə</button>
            <button class="admin-action-btn admin-action-btn--danger" data-delete-complex="${c.id}">Sil</button>
          </div>
        </td>
      </tr>`).join("");

    tbody.querySelectorAll("[data-edit-complex]").forEach((btn) => {
      btn.addEventListener("click", () => openComplexModal(Number(btn.dataset.editComplex)));
    });
    tbody.querySelectorAll("[data-delete-complex]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (confirm("Bu kompleksi silmək istədiyinizə əminsiniz?")) {
          deleteComplex(btn.dataset.deleteComplex);
          renderComplexes();
          renderDashboard();
        }
      });
    });
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
    const listing = id ? getAdminListingById(id) : null;
    openModal(id ? "Obyekti redaktə et" : "Yeni obyekt (qaralama)");

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
          <input type="number" name="rooms" min="0" value="${listing?.rooms ?? ""}">
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
        <textarea name="description" rows="3" placeholder="Obyekt haqqında ətraflı məlumat...">${listing?.description || ""}</textarea>
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
    const complex = id ? getStore().complexes.find((c) => c.id === id) : null;
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

  modalForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(modalForm);

    if (currentModalType === "listing") {
      const areaVal = fd.get("area");
      let area = areaVal;
      if (areaVal && !isNaN(areaVal) && !String(areaVal).includes("sot")) {
        area = Number(areaVal);
      }

      const status = fd.get("status");
      const existing = editingId ? getAdminListingById(editingId) : null;

      const listing = {
        id: editingId || generateListingId(),
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
      };
      upsertListing(listing);
      renderListings();
    }

    if (currentModalType === "complex") {
      upsertComplex({
        id: editingId || generateComplexId(),
        name: fd.get("name").trim(),
        priceFrom: fd.get("priceFrom").trim(),
        location: fd.get("location").trim(),
        deadline: fd.get("deadline").trim(),
        image: fd.get("image").trim(),
        developer: fd.get("developer")?.trim() || undefined,
      });
      renderComplexes();
    }

    renderDashboard();
    closeModal();
  });

  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("modalCancel").addEventListener("click", closeModal);
  document.querySelector(".admin-modal__overlay").addEventListener("click", closeModal);
  document.getElementById("addListingBtn").addEventListener("click", () => openListingModal());
  document.getElementById("addComplexBtn").addEventListener("click", () => openComplexModal());
  document.getElementById("listingSearch").addEventListener("input", renderListings);
  document.getElementById("listingFilter").addEventListener("change", renderListings);

  document.getElementById("resetDataBtn").addEventListener("click", () => {
    if (confirm("Bütün admin dəyişiklikləri silinəcək. Davam edilsin?")) {
      resetStore();
      renderDashboard();
      alert("İlkin məlumatlar bərpa edildi.");
    }
  });
})();

function formatPrice(price) {
  if (String(price).includes("/")) {
    const [amount, period] = String(price).split("/");
    return `${amount} ₼/${period}`;
  }
  return `${price} ₼`;
}
