const MONTHS = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avqust", "sentyabr", "oktyabr", "noyabr", "dekabr",
];

function formatNumber(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return String(n);
  return Math.round(num)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function parsePriceInput(priceStr, listingType) {
  const raw = String(priceStr || "").trim();
  let period = "none";
  let type = listingType || "sale";
  let amountPart = raw;

  if (raw.includes("/")) {
    const [amount, suffix] = raw.split("/");
    amountPart = amount;
    const s = (suffix || "").toLowerCase();
    if (s.includes("ay") || s.includes("month")) {
      period = "month";
      type = "rent";
    } else if (s.includes("gün") || s.includes("gun") || s.includes("day")) {
      period = "day";
      type = "daily";
    }
  } else if (type === "rent") {
    period = "month";
  } else if (type === "daily") {
    period = "day";
  }

  const price = Number(String(amountPart).replace(/\s/g, "").replace(",", "."));
  return {
    price: Number.isFinite(price) ? price : 0,
    price_period: period,
    listing_type: type,
  };
}

function formatPriceDisplay(price, pricePeriod, listingType) {
  const formatted = formatNumber(price);
  const period = pricePeriod || "none";
  if (period === "month" || listingType === "rent") return `${formatted}/ay`;
  if (period === "day" || listingType === "daily") return `${formatted}/gün`;
  return formatted;
}

function parseAreaInput(areaVal) {
  if (areaVal === undefined || areaVal === null || areaVal === "") {
    return { area: null, area_unit: "m2" };
  }
  const str = String(areaVal).trim();
  if (str.includes("sot")) {
    const n = parseFloat(str.replace(/[^\d.,]/g, "").replace(",", "."));
    return { area: Number.isFinite(n) ? n : null, area_unit: "sot" };
  }
  const n = Number(str);
  return { area: Number.isFinite(n) ? n : null, area_unit: "m2" };
}

function formatAreaDisplay(area, areaUnit) {
  if (area === null || area === undefined) return undefined;
  if (areaUnit === "sot") return `${Number(area)} sot`;
  const n = Number(area);
  return Number.isInteger(n) ? n : n;
}

function formatDateDisplay(publishedAt, city) {
  if (!publishedAt) return "";
  const d = publishedAt instanceof Date ? publishedAt : new Date(publishedAt);
  if (Number.isNaN(d.getTime())) return "";
  const place = city || "Bakı";
  return `${place}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function parseTags(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "object") {
    try {
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function listingFromRow(row) {
  if (!row) return null;
  const area = formatAreaDisplay(row.area, row.area_unit);
  return {
    id: row.id,
    title: row.title || undefined,
    price: formatPriceDisplay(row.price, row.price_period, row.listing_type),
    location: row.location,
    city: row.city,
    district: row.district || undefined,
    rooms: row.rooms != null ? Number(row.rooms) : undefined,
    area,
    floor: row.floor || undefined,
    image: row.image_url || "",
    description: row.description || undefined,
    phone: row.phone || undefined,
    listingType: row.listing_type,
    status: row.status,
    premium: Boolean(row.is_premium),
    category: row.category,
    tags: parseTags(row.tags),
    date: formatDateDisplay(row.published_at || row.created_at, row.city),
    agency: false,
  };
}

function listingToDb(body, existing = null) {
  const listingType = body.listingType || existing?.listingType || "sale";
  const parsed = parsePriceInput(body.price, listingType);
  const areaParsed = parseAreaInput(body.area);
  const status = body.status || existing?.status || "draft";
  const tags = Array.isArray(body.tags) ? body.tags : parseTags(body.tags);

  let city = body.city || existing?.city || "Bakı";
  if (body.date && typeof body.date === "string" && body.date.includes(",")) {
    city = body.date.split(",")[0].trim() || city;
  }

  return {
    title: body.title || null,
    price: parsed.price,
    price_period: parsed.price_period,
    listing_type: parsed.listing_type,
    status,
    is_premium: body.premium ? 1 : 0,
    category: body.category || "apartment",
    location: body.location,
    city,
    district: body.district || null,
    rooms: body.rooms != null && body.rooms !== "" ? Number(body.rooms) : null,
    area: areaParsed.area,
    area_unit: areaParsed.area_unit,
    floor: body.floor || null,
    image_url: body.image || null,
    description: body.description || null,
    phone: body.phone || null,
    tags: JSON.stringify(tags),
    published_at:
      status === "published"
        ? existing?.date
          ? undefined
          : new Date()
        : null,
  };
}

function formatPriceFromNumber(n) {
  return formatNumber(n);
}

function complexFromRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    priceFrom: formatPriceFromNumber(row.price_from),
    location: row.location,
    developer: row.developer || undefined,
    deadline: row.deadline || "",
    image: row.image_url || "",
    description: row.description || undefined,
  };
}

function complexToDb(body) {
  const priceFrom = Number(String(body.priceFrom || "0").replace(/\s/g, "").replace(",", "."));
  return {
    name: body.name,
    price_from: Number.isFinite(priceFrom) ? priceFrom : 0,
    location: body.location,
    developer: body.developer || null,
    deadline: body.deadline || null,
    image_url: body.image || null,
    description: body.description || null,
    is_active: 1,
  };
}

function formatDateNow(city = "Bakı") {
  const now = new Date();
  return `${city}, ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
}

module.exports = {
  listingFromRow,
  listingToDb,
  complexFromRow,
  complexToDb,
  formatDateNow,
  parsePriceInput,
  formatPriceDisplay,
};
