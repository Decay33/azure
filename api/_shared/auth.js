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

  const displayName =
    getClaim(
      principal,
      "name",
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
    ) || email || principal.userId;

  const provider =
    principal.identityProvider ||
    getClaim(principal, "iss", "http://schemas.microsoft.com/identity/claims/identityprovider") ||
    "unknown";

  return {
    userId: principal.userId,
    playerId: principal.userId,
    displayName,
    email: email || null,
    provider
  };
}

function getUser(req) {
  const headers = req?.headers || {};
  let headerValue = headers["x-ms-client-principal"];

  if (!headerValue) {
    const entry = Object.entries(headers).find(([key]) => key.toLowerCase() === "x-ms-client-principal");
    if (entry) {
      headerValue = entry[1];
    }
  }

  const principal = decodePrincipal(headerValue);
  return extractUser(principal);
}

module.exports = {
  getUser
};
