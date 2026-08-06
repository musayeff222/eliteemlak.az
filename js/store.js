const AUTH_KEY = "elite_emlak_admin_token";

const LISTING_TYPES = {
  sale: "Satış",
  rent: "Kirayə",
  daily: "Günlük",
};

let _cache = {
  listings: null,
  adminListings: null,
  complexes: null,
  settings: null,
};

function getToken() {
  return sessionStorage.getItem(AUTH_KEY);
}

function setToken(token) {
  if (token) sessionStorage.setItem(AUTH_KEY, token);
  else sessionStorage.removeItem(AUTH_KEY);
}

async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(path, { ...options, headers });
  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    const msg = (data && data.error) || `Xəta (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

function invalidateCache() {
  _cache.listings = null;
  _cache.adminListings = null;
  _cache.complexes = null;
  _cache.settings = null;
}

async function loadPublishedListings() {
  if (_cache.listings) return _cache.listings;
  _cache.listings = await api("/api/listings");
  return _cache.listings;
}

async function loadAdminListings() {
  _cache.adminListings = await api("/api/admin/listings");
  return _cache.adminListings;
}

async function loadComplexes(admin = false) {
  if (!admin && _cache.complexes) return _cache.complexes;
  const path = admin ? "/api/admin/complexes" : "/api/complexes";
  const data = await api(path);
  if (!admin) _cache.complexes = data;
  return data;
}

async function getStore() {
  const [listings, complexes] = await Promise.all([
    isAdminLoggedIn() ? loadAdminListings() : loadPublishedListings(),
    loadComplexes(isAdminLoggedIn()),
  ]);
  return {
    listings,
    complexes,
    settings: _cache.settings || {},
  };
}

async function getPublishedListings() {
  return loadPublishedListings();
}

async function getFeaturedListings() {
  const all = await loadPublishedListings();
  return all.filter((l) => l.premium);
}

async function getAllListings() {
  return getPublishedListings();
}

async function getAgencyListings() {
  return getFeaturedListings();
}

async function getPremiumListings() {
  return getFeaturedListings();
}

async function getResidentialComplexes() {
  return loadComplexes(false);
}

async function getActiveListingCount() {
  const list = await getPublishedListings();
  return list.length;
}

async function getListingById(id, admin = false) {
  if (admin) {
    return api(`/api/admin/listings/${id}`);
  }
  try {
    return await api(`/api/listings/${id}`);
  } catch {
    return null;
  }
}

async function getAdminListingById(id) {
  try {
    return await api(`/api/admin/listings/${id}`);
  } catch {
    return null;
  }
}

async function upsertListing(listing) {
  let result;
  if (listing.id) {
    result = await api(`/api/admin/listings/${listing.id}`, {
      method: "PUT",
      body: JSON.stringify(listing),
    });
  } else {
    result = await api("/api/admin/listings", {
      method: "POST",
      body: JSON.stringify(listing),
    });
  }
  invalidateCache();
  return result;
}

async function toggleListingPublish(id) {
  const result = await api(`/api/admin/listings/${id}/publish`, {
    method: "PATCH",
  });
  invalidateCache();
  return result;
}

async function deleteListing(id) {
  await api(`/api/admin/listings/${id}`, { method: "DELETE" });
  invalidateCache();
}

async function upsertComplex(complex) {
  let result;
  if (complex.id) {
    result = await api(`/api/admin/complexes/${complex.id}`, {
      method: "PUT",
      body: JSON.stringify(complex),
    });
  } else {
    result = await api("/api/admin/complexes", {
      method: "POST",
      body: JSON.stringify(complex),
    });
  }
  invalidateCache();
  return result;
}

async function deleteComplex(id) {
  await api(`/api/admin/complexes/${id}`, { method: "DELETE" });
  invalidateCache();
}

async function persistSettings(settings) {
  const result = await api("/api/settings", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
  _cache.settings = result;
  return result;
}

async function loadSettings() {
  _cache.settings = await api("/api/settings");
  return _cache.settings;
}

async function getAdminStats() {
  return api("/api/admin/stats");
}

async function getContacts() {
  return api("/api/admin/contacts");
}

async function markContactRead(id) {
  return api(`/api/admin/contacts/${id}/read`, { method: "PATCH" });
}

async function markAllContactsRead() {
  return api("/api/admin/contacts/read-all", { method: "PATCH" });
}

async function deleteContact(id) {
  return api(`/api/admin/contacts/${id}`, { method: "DELETE" });
}

async function submitContact(payload) {
  return api("/api/contacts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function bulkListings(ids, action) {
  const result = await api("/api/admin/listings/bulk", {
    method: "POST",
    body: JSON.stringify({ ids, action }),
  });
  invalidateCache();
  return result;
}

async function duplicateListing(id) {
  const result = await api(`/api/admin/listings/${id}/duplicate`, {
    method: "POST",
  });
  invalidateCache();
  return result;
}

async function getAdminProfile() {
  return api("/api/auth/me");
}

async function updateAdminProfile(payload) {
  return api("/api/auth/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

async function changeAdminPassword(currentPassword, newPassword) {
  return api("/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

async function uploadImage(file) {
  const fd = new FormData();
  fd.append("image", file);
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch("/api/admin/upload", {
    method: "POST",
    headers,
    body: fd,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Yükləmə xətası (${res.status})`);
  return data.url;
}

async function resetStore() {
  invalidateCache();
  return getStore();
}

function isAdminLoggedIn() {
  return Boolean(getToken());
}

async function adminLogin(username, password) {
  const result = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  setToken(result.token);
  invalidateCache();
  return true;
}

function adminLogout() {
  setToken(null);
  invalidateCache();
}

function formatDateNow(city = "Bakı") {
  const months = [
    "yanvar", "fevral", "mart", "aprel", "may", "iyun",
    "iyul", "avqust", "sentyabr", "oktyabr", "noyabr", "dekabr",
  ];
  const now = new Date();
  return `${city}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

function generateListingId() {
  return null;
}

function generateComplexId() {
  return null;
}
