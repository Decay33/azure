export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { verifyBearer } from "@/server/auth/verifyJwt";
import { ensureUserDocument } from "@/server/stores/userStore";
import { getProfileByUserId, upsertProfile } from "@/server/stores/profileStore";
import { profileInputSchema } from "@/server/validation/schemas";

const jsonError = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

export async function GET(req: NextRequest) {
  try {
    const claims = await verifyBearer(req.headers.get("authorization") ?? undefined);

    await ensureUserDocument(claims.sub, {
      email: Array.isArray(claims.emails) ? claims.emails[0] : undefined,
      name: typeof claims.name === "string" ? claims.name : undefined
    });

    const profile =
      (await getProfileByUserId(claims.sub)) ??
      (await upsertProfile(claims.sub, {
        displayName: claims.name ?? claims.emails?.[0] ?? "New Creator"
      }));

    return NextResponse.json(profile);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load profile";
    return jsonError(message, message === "Missing token" ? 401 : 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const claims = await verifyBearer(req.headers.get("authorization") ?? undefined);
    const payload = profileInputSchema.parse(await req.json());

    const profile = await upsertProfile(claims.sub, {
      displayName: payload.displayName ?? claims.name ?? claims.emails?.[0] ?? "Creator",
      bio: payload.bio,
      username: payload.username?.toLowerCase(),
      avatarUrl: payload.avatarUrl,
      backgroundVideos: payload.backdrops,
      theme: payload.theme,
      social: payload.social
    });

    return NextResponse.json(profile);
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return jsonError("Invalid payload", 400);
    }

    const message = error instanceof Error ? error.message : "Unable to save profile";
    return jsonError(message, message === "Missing token" ? 401 : 500);
  }
}
