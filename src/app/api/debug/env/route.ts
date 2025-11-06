export const runtime = "nodejs";

import { NextResponse } from "next/server";

const keys = [
  "COSMOS_DB_CONNECTION_STRING",
  "COSMOS_DB_DATABASE_ID",
  "COSMOS_DB_USERS_CONTAINER",
  "COSMOS_DB_PROFILES_CONTAINER",
  "COSMOS_DB_LINKS_CONTAINER",
  "STORAGE_CONNECTION_STRING",
  "AZURE_STORAGE_ACCOUNT",
  "STORAGE_CONTAINER_NAME",
  "NEXT_PUBLIC_B2C_AUTHORITY",
  "NEXT_PUBLIC_B2C_CLIENT_ID",
  "NEXT_PUBLIC_B2C_SCOPE",
  "NEXT_PUBLIC_B2C_POLICY",
  "B2C_API_AUDIENCE",
  "USE_MOCK_DATA"
];

export async function GET() {
  const present = Object.fromEntries(keys.map((key) => [key, Boolean(process.env[key])]));

  return NextResponse.json({
    node: process.version,
    present
  });
}
