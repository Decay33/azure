export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { verifyBearer } from "@/server/auth/verifyJwt";
import { issueWriteSas } from "@/server/storage/blob";
import { uploadInputSchema } from "@/server/validation/schemas";

const sanitizeFilename = (filename: string) => filename.replace(/[^a-z0-9.\-_]/gi, "-");

export async function POST(req: NextRequest) {
  try {
    const claims = await verifyBearer(req.headers.get("authorization") ?? undefined);
    const payload = uploadInputSchema.parse(await req.json());

    const safeFilename = sanitizeFilename(payload.filename);
    const blobPath = `backdrops/${claims.sub}/${Date.now()}-${safeFilename}`;

    const sas = await issueWriteSas(blobPath, 15);

    return NextResponse.json({
      uploadUrl: sas.uploadUrl,
      blobUrl: sas.blobUrl,
      expiresInMinutes: sas.expiresInMinutes,
      headers: {
        "x-ms-blob-type": "BlockBlob",
        "Content-Type": payload.contentType ?? "video/mp4"
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to issue upload URL";
    const status = message === "Missing token" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
