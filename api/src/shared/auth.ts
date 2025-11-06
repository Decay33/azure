import { HttpRequest } from "@azure/functions";

export function getUserId(req: HttpRequest): string | null {
  // Azure Static Web Apps auth adds user info to headers
  const clientPrincipal = req.headers.get('x-ms-client-principal');
  
  if (!clientPrincipal) {
    return null;
  }

  try {
    const decoded = Buffer.from(clientPrincipal, 'base64').toString('utf-8');
    const principal = JSON.parse(decoded);
    return principal.userId || principal.userDetails || null;
  } catch {
    return null;
  }
}

