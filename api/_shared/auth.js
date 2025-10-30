function decodePrincipal(headerValue) {
  if (!headerValue) {
    return null;
  }

  try {
    const decoded = Buffer.from(headerValue, "base64").toString("utf8");
    return JSON.parse(decoded);
  } catch (_err) {
    return null;
  }
}

function getClaim(principal, ...claimTypes) {
  if (!principal?.claims) {
    return undefined;
  }

  const types = claimTypes.map((c) => c.toLowerCase());

  for (const claim of principal.claims) {
    if (claim?.typ && types.includes(claim.typ.toLowerCase())) {
      return claim.val;
    }
  }

  return undefined;
}

function sanitizeNameCandidate(raw) {
  if (!raw) {
    return null;
  }

  let value = String(raw).trim();
  if (!value) {
    return null;
  }

  const atIndex = value.indexOf("@");
  if (atIndex > 0) {
    value = value.slice(0, atIndex);
  }

  value = value.split(/\s+/)[0];
  value = value.replace(/[^A-Za-z0-9_-]/g, "");

  if (!value) {
    return null;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function deriveFirstName(...candidates) {
  for (const candidate of candidates) {
    const sanitized = sanitizeNameCandidate(candidate);
    if (sanitized) {
      return sanitized;
    }
  }
  return "Player";
}

function extractUser(principal) {
  if (!principal?.userId) {
    return null;
  }

  const email =
    getClaim(
      principal,
      "emails",
      "preferred_username",
      "email",
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
    ) || principal.userDetails;

  const rawDisplayName =
    getClaim(
      principal,
      "name",
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
    ) || email || principal.userId;

  const provider =
    principal.identityProvider ||
    getClaim(principal, "iss", "http://schemas.microsoft.com/identity/claims/identityprovider") ||
    "unknown";

  const displayName = rawDisplayName;
  const firstName = deriveFirstName(rawDisplayName, email, principal.userDetails, principal.userId);

  return {
    id: principal.userId,
    playerId: principal.userId,
    displayName,
    firstName,
    email: email || null,
    provider,
    roles: principal.userRoles || []
  };
}

function getPrincipal(req) {
  const headers = req?.headers || {};
  let headerValue = headers["x-ms-client-principal"];

  if (!headerValue) {
    const entry = Object.entries(headers).find(
      ([key]) => typeof key === "string" && key.toLowerCase() === "x-ms-client-principal"
    );
    if (entry) {
      headerValue = entry[1];
    }
  }

  return decodePrincipal(headerValue);
}

function getUser(req) {
  const principal = getPrincipal(req);
  return extractUser(principal);
}

module.exports = {
  decodePrincipal,
  getPrincipal,
  getUser,
  extractUser
};
