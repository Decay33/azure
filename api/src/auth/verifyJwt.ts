import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { config } from "../config";

const required = (value: string | undefined, name: string): string => {
  if (!value) {
    throw new Error(`Missing required auth configuration: ${name}`);
  }
  return value;
};

const authority = required(config.auth.authority, "NEXT_PUBLIC_B2C_AUTHORITY");
const policy = required(config.auth.policy, "NEXT_PUBLIC_B2C_POLICY");
const audience = required(config.auth.audience, "B2C_API_AUDIENCE");

const authorityBase = authority.replace(/\/v2\.0$/i, "");
const jwksUri = new URL(`${authorityBase}/discovery/v2.0/keys`);
const issuer = `${authorityBase}/v2.0/`;

const jwks = createRemoteJWKSet(jwksUri);

export interface VerifiedClaims extends JWTPayload {
  sub: string;
  emails?: string[];
  name?: string;
}

export const verifyBearer = async (token: string): Promise<VerifiedClaims> => {
  const { payload } = await jwtVerify(token, jwks, {
    audience,
    issuer
  });

  const tfp = (payload as Record<string, unknown>)["tfp"] ?? (payload as Record<string, unknown>)["acr"];

  if (tfp !== policy) {
    throw new Error("Invalid policy");
  }

  return payload as VerifiedClaims;
};
