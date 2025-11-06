export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getDatabase } from "@/server/cosmos/client";
import { getBlobServiceClient } from "@/server/storage/blob";

export async function GET() {
  try {
    await getDatabase().containers.readAll().fetchAll();

    let containerCount = 0;
    const service = getBlobServiceClient();
    for await (const container of service.listContainers()) {
      void container;
      containerCount += 1;
    }

    return NextResponse.json({
      status: "ok",
      containers: containerCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
