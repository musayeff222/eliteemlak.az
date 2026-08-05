function formatPrice(price) {
  const p = String(price ?? "");
  if (p.includes("/")) {
    const [amount, period] = p.split("/");
    return `${amount} ₼/${period}`;
  }
  return `${p} ₼`;
}

function formatSpecs(listing) {
  const parts = [];
  if (listing.rooms) parts.push(`${listing.rooms} otaqlı`);
  if (listing.area) {
    const isSot = typeof listing.area === "string" && listing.area.includes("sot");
    const unit = isSot ? "" : " m²";
    parts.push(`${listing.area}${unit}`);
  }
  if (listing.floor) parts.push(`${listing.floor} mərtəbə`);
  return parts.join(" • ");
}

async function getPublicListingById(id) {
  return getListingById(id, false);
}
