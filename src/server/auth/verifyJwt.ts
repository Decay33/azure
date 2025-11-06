import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

const getConfig = () => {
  const authority = process.env.NEXT_PUBLIC_B2C_AUTHORITY;
  const audience = process.env.B2C_API_AUDIENCE;
  const policy = process.env.NEXT_PUBLIC_B2C_POLICY;

  if (!authority || !audience || !policy) {
    throw new Error("B2C authority, audience, and policy environment variables must be set.");
  }

  return { authority, audience, policy };
};

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
let issuer: string | null = null;

const getJwks = () => {
  if (jwks && issuer) {
    return { jwks, issuer };
  }

  const { authority } = getConfig();
  const authorityBase = authority.replace(/\/v2\.0$/i, "");
  issuer = `${authorityBase}/v2.0/`;
  const jwksUrl = new URL(`${authorityBase}/discovery/v2.0/keys`);
  jwks = createRemoteJWKSet(jwksUrl);

  return { jwks, issuer };
};

export interface VerifiedClaims extends JWTPayload {
  sub: string;
  emails?: string[];
  name?: string;
}

export async function verifyBearer(authHeader?: string): Promise<VerifiedClaims> {
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
    throw new Error("Missing token");
  }

  const token = authHeader.slice(7);
  const { audience, policy } = getConfig();
  const { jwks, issuer } = getJwks();

  const { payload } = await jwtVerify(token, jwks, {
    audience,
    issuer
  });

  const tfp = (payload as Record<string, unknown>)["tfp"] ?? (payload as Record<string, unknown>)["acr"];

  if (tfp !== policy) {
    throw new Error("Invalid policy");
  }

  return payload as VerifiedClaims;
}
