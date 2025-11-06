export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { verifyBearer } from "@/server/auth/verifyJwt";
import { getProfileByUserId, upsertProfile } from "@/server/stores/profileStore";
import { getLinksForProfile, replaceLinksForProfile } from "@/server/stores/linksStore";
import { linksInputSchema } from "@/server/validation/schemas";

const jsonError = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

const ensureProfile = async (userId: string, fallbackName?: string | null) => {
  const existing = await getProfileByUserId(userId);
  if (existing) {
    return existing;
  }

  return upsertProfile(userId, {
    displayName: fallbackName ?? "Creator"
  });
};

export async function GET(req: NextRequest) {
  try {
    const claims = await verifyBearer(req.headers.get("authorization") ?? undefined);
    const profile = await ensureProfile(claims.sub, claims.name ?? claims.emails?.[0]);
    const items = await getLinksForProfile(profile.id);
    return NextResponse.json({ links: items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load links";
    return jsonError(message, message === "Missing token" ? 401 : 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const claims = await verifyBearer(req.headers.get("authorization") ?? undefined);
    const payload = linksInputSchema.parse(await req.json());

    const profile = await ensureProfile(claims.sub, claims.name ?? claims.emails?.[0]);
    const updated = await replaceLinksForProfile(profile.id, claims.sub, payload);

    return NextResponse.json({ links: updated });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return jsonError("Invalid payload", 400);
    }

    const message = error instanceof Error ? error.message : "Unable to save links";
    return jsonError(message, message === "Missing token" ? 401 : 500);
  }
}
