const STORE_KEY = "elite_emlak_store";
const AUTH_KEY = "elite_emlak_admin_auth";

const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin123",
};

const LISTING_TYPES = {
  sale: "Satış",
  rent: "Kirayə",
  daily: "Günlük",
};

function dedupeListings(items) {
  const map = new Map();
  items.forEach((item) => map.set(item.id, { ...map.get(item.id), ...item }));
  return [...map.values()];
}

function inferListingType(price) {
  const p = String(price);
  if (p.includes("/ay")) return "rent";
  if (p.includes("/gün")) return "daily";
  return "sale";
}

function normalizeListing(listing) {
  return {
    ...listing,
    status: listing.status || "published",
    listingType: listing.listingType || inferListingType(listing.price),
    agency: false,
  };
}

function normalizeListings(listings) {
  return listings.map(normalizeListing);
}

function buildDefaultStore() {
  const listings = normalizeListings(dedupeListings([...AGENCY_LISTINGS, ...ALL_LISTINGS]));
  return {
    listings,
    complexes: JSON.parse(JSON.stringify(RESIDENTIAL_COMPLEXES)),
    settings: {},
  };
}

function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return buildDefaultStore();
    const parsed = JSON.parse(raw);
    return {
      listings: normalizeListings(parsed.listings || []),
      complexes: parsed.complexes || [],
      settings: parsed.settings || {},
    };
  } catch {
    return buildDefaultStore();
  }
}

function saveStore(store) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

function getStore() {
  return loadStore();
}

function persistListings(listings) {
  const store = loadStore();
  store.listings = normalizeListings(listings);
  saveStore(store);
}

function persistComplexes(complexes) {
  const store = loadStore();
  store.complexes = complexes;
  saveStore(store);
}

function persistSettings(settings) {
  const store = loadStore();
  store.settings = { ...store.settings, ...settings };
  saveStore(store);
}

function getPublishedListings() {
  return loadStore().listings.filter((l) => l.status === "published");
}

function getFeaturedListings() {
  return getPublishedListings().filter((l) => l.premium);
}

function getAllListings() {
  return getPublishedListings();
}

function getAgencyListings() {
  return getFeaturedListings();
}

function getPremiumListings() {
  return getFeaturedListings();
}

function getResidentialComplexes() {
  return loadStore().complexes;
}

function getActiveListingCount() {
  return getPublishedListings().length;
}

function getListingById(id, admin = false) {
  const listing = loadStore().listings.find((l) => l.id === Number(id));
  if (!listing) return null;
  if (!admin && listing.status !== "published") return null;
  return listing;
}

function generateListingId() {
  const listings = loadStore().listings;
  const maxId = listings.reduce((max, l) => Math.max(max, l.id), 0);
  return maxId + 1;
}

function generateComplexId() {
  const complexes = loadStore().complexes;
  const maxId = complexes.reduce((max, c) => Math.max(max, c.id), 0);
  return maxId + 1;
}

function upsertListing(listing) {
  const store = loadStore();
  const normalized = normalizeListing(listing);
  const index = store.listings.findIndex((l) => l.id === normalized.id);
  if (index >= 0) store.listings[index] = normalized;
  else store.listings.unshift(normalized);
  saveStore(store);
  return normalized;
}

function toggleListingPublish(id) {
  const store = loadStore();
  const listing = store.listings.find((l) => l.id === Number(id));
  if (!listing) return null;
  listing.status = listing.status === "published" ? "draft" : "published";
  if (listing.status === "published" && !listing.date) {
    listing.date = formatDateNow();
  }
  saveStore(store);
  return listing;
}

function deleteListing(id) {
  const store = loadStore();
  store.listings = store.listings.filter((l) => l.id !== Number(id));
  saveStore(store);
}

function upsertComplex(complex) {
  const store = loadStore();
  const index = store.complexes.findIndex((c) => c.id === complex.id);
  if (index >= 0) store.complexes[index] = complex;
  else store.complexes.unshift(complex);
  saveStore(store);
  return complex;
}

function deleteComplex(id) {
  const store = loadStore();
  store.complexes = store.complexes.filter((c) => c.id !== Number(id));
  saveStore(store);
}

function resetStore() {
  localStorage.removeItem(STORE_KEY);
  return buildDefaultStore();
}

function isAdminLoggedIn() {
  return sessionStorage.getItem(AUTH_KEY) === "true";
}

function adminLogin(username, password) {
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    sessionStorage.setItem(AUTH_KEY, "true");
    return true;
  }
  return false;
}

function adminLogout() {
  sessionStorage.removeItem(AUTH_KEY);
}

function formatDateNow(city = "Bakı") {
  const months = [
    "yanvar", "fevral", "mart", "aprel", "may", "iyun",
    "iyul", "avqust", "sentyabr", "oktyabr", "noyabr", "dekabr",
  ];
  const now = new Date();
  return `${city}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

function getAdminListingById(id) {
  return loadStore().listings.find((l) => l.id === Number(id));
}
