const crypto = require("crypto");

function normalizeIdentifier(value) {
  if (!value) {
    return null;
  }

  const cleaned = value.toString().trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-");
  return cleaned.replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function durableIdFromPrincipal(principal) {
  if (!principal) {
    return `guest-${crypto.randomBytes(4).toString("hex")}`;
  }

  const candidates = [principal.id, principal.userId, principal.userDetails];
  for (const candidate of candidates) {
    const normalized = normalizeIdentifier(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return `guest-${crypto.randomBytes(4).toString("hex")}`;
}

function createDocumentId(prefix) {
  const base = normalizeIdentifier(prefix) || "doc";
  const ts = Date.now();
  const random = crypto.randomBytes(6).toString("hex");
  return `${base}-${ts}-${random}`;
}

module.exports = {
  durableIdFromPrincipal,
  createDocumentId
};
