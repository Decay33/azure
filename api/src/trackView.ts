import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { CosmosConfigError, getProfileByHandle, incrementProfileViews } from "./shared/cosmos";

export async function trackView(req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const body = (await req.json().catch(() => ({}))) as { handle?: string };
    const handle = body.handle || req.params?.handle;
    
    if (!handle) {
      return { status: 400, jsonBody: { error: "Handle is required" } };
    }

    const profile = await getProfileByHandle(handle);
    
    if (!profile) {
      return { status: 404, jsonBody: { error: "Profile not found" } };
    }

    await incrementProfileViews(handle);

    return {
      status: 200,
      jsonBody: { success: true }
    };
  } catch (error: any) {
    if (error instanceof CosmosConfigError) {
      context.error("Cosmos configuration error:", error.message);
      return {
        status: 500,
        jsonBody: { error: error.message }
      };
    }
    context.error("Error tracking view:", error);
    return {
      status: 500,
      jsonBody: { error: "Failed to track view" }
    };
  }
}

app.http("trackView", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "trackView",
  handler: trackView
});

