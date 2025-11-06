import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getProfileByHandle } from "./shared/cosmos";

export async function trackView(req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const handle = req.params.handle;
    
    if (!handle) {
      return { status: 400, jsonBody: { error: "Handle is required" } };
    }

    const profile = await getProfileByHandle(handle);
    
    if (!profile) {
      return { status: 404, jsonBody: { error: "Profile not found" } };
    }

    // Increment view count
    const endpoint = process.env.COSMOS_ENDPOINT || "";
    const key = process.env.COSMOS_KEY || "";
    const databaseId = process.env.COSMOS_DB || "gamehub";
    const containerId = process.env.COSMOS_PROFILES || "profiles";

    const { CosmosClient } = await import("@azure/cosmos");
    const client = new CosmosClient({ endpoint, key });
    const container = client.database(databaseId).container(containerId);

    const updatedProfile = {
      ...profile,
      views: (profile.views || 0) + 1,
      updatedAt: new Date().toISOString()
    };

    await container.item(handle, handle).replace(updatedProfile);

    return {
      status: 200,
      jsonBody: { success: true }
    };
  } catch (error: any) {
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
  route: "trackView/{handle}",
  handler: trackView
});

