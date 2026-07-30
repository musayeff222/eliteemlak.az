function formatPrice(price) {
  if (price.includes("/")) {
    const [amount, period] = price.split("/");
    return `${amount} ₼/${period}`;
  }
  return `${price} ₼`;
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

function getPublicListingById(id) {
  return getListingById(id, false);
}
