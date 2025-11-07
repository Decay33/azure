export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getProfileByUsername } from "@/server/stores/profileStore";

type RouteContext = {
  params: Promise<{
    username: string;
  }>;
};

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { username } = await context.params;
    const profile = await getProfileByUsername(username);

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(profile, {
      headers: {
        "Cache-Control": "public, max-age=30"
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
