import { Context, HttpRequest } from "@azure/functions";

export interface ClientPrincipal {
  identityProvider: string;
  userId: string;
  userDetails: string;
  userRoles: string[];
  claims: Array<{
    typ: string;
    val: string;
  }>;
}

const decodeClientPrincipal = (encoded: string): ClientPrincipal | null => {
  try {
    const decoded = Buffer.from(encoded, "base64").toString("utf8");
    return JSON.parse(decoded) as ClientPrincipal;
  } catch (error) {
    console.error("Failed to decode client principal", error);
    return null;
  }
};

export const getClientPrincipal = (req: HttpRequest): ClientPrincipal | null => {
  const header =
    req.headers?.["x-ms-client-principal"] ??
    req.headers?.["X-MS-CLIENT-PRINCIPAL"] ??
    req.get?.("x-ms-client-principal") ??
    req.get?.("X-MS-CLIENT-PRINCIPAL");

  if (!header) {
    return null;
  }

  return decodeClientPrincipal(header);
};

export const requireAuthenticatedUser = (context: Context, req: HttpRequest): ClientPrincipal | null => {
  const principal = getClientPrincipal(req);

  if (!principal) {
    context.log.warn("No authenticated principal found.");
  }

  return principal;
};
