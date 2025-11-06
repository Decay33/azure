import { Context, HttpRequest } from "@azure/functions";
import { verifyBearer, type VerifiedClaims } from "../auth/verifyJwt";
import { unauthorized } from "./http";

const extractBearer = (req: HttpRequest): string | null => {
  const headers = req.headers as Record<string, string | undefined>;
  const header = headers["authorization"] ?? headers["Authorization"];
  if (!header) {
    return null;
  }

  if (!header.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  return header.slice(7).trim();
};

export const authenticateRequest = async (
  context: Context,
  req: HttpRequest
): Promise<VerifiedClaims | null> => {
  const token = extractBearer(req);

  if (!token) {
    unauthorized(context, { error: "Missing bearer token" });
    return null;
  }

  try {
    return await verifyBearer(token);
  } catch (error) {
    context.log.error("Token verification failed", error);
    unauthorized(context, { error: "Invalid token" });
    return null;
  }
};
