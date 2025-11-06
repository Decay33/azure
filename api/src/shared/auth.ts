import { HttpRequest } from '@azure/functions';

export interface ClientPrincipal {
  identityProvider: string;
  userId: string;
  userDetails: string;
  userRoles: string[];
}

export function getClientPrincipal(req: HttpRequest): ClientPrincipal | null {
  const header = req.headers.get('x-ms-client-principal');
  if (!header) {
    return null;
  }

  try {
    const encoded = Buffer.from(header, 'base64');
    const decoded = encoded.toString('utf-8');
    return JSON.parse(decoded) as ClientPrincipal;
  } catch (error) {
    console.error('Failed to parse client principal:', error);
    return null;
  }
}

export function requireAuth(req: HttpRequest): ClientPrincipal {
  const principal = getClientPrincipal(req);
  if (!principal) {
    throw new Error('Unauthorized');
  }
  return principal;
}

export function getUserId(principal: ClientPrincipal): string {
  return `${principal.identityProvider}:${principal.userId}`;
}


