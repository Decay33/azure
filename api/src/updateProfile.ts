import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getUserId } from "./shared/auth";
import { updateProfile } from "./shared/cosmos";

export async function updateUserProfile(req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const body: any = await req.json();
    const { handle, displayName, links, videoLinks } = body;
    
    if (!handle) {
      return { status: 400, jsonBody: { error: "Handle is required" } };
    }

    // Find user by handle instead of userId (for now)
    const { getProfileByHandle } = await import("./shared/cosmos");
    const profile = await getProfileByHandle(handle);
    
    if (!profile) {
      return { status: 404, jsonBody: { error: "Profile not found" } };
    }

    // Update profile directly by handle
    const { CosmosClient } = await import("@azure/cosmos");
    const endpoint = process.env.COSMOS_ENDPOINT || "";
    const key = process.env.COSMOS_KEY || "";
    const databaseId = process.env.COSMOS_DB || "gamehub";
    const containerId = process.env.COSMOS_PROFILES || "Profiles";
    
    const client = new CosmosClient({ endpoint, key });
    const container = client.database(databaseId).container(containerId);
    
    const updated = {
      ...profile,
      displayName: displayName !== undefined ? displayName : profile.displayName,
      links: links !== undefined ? links : profile.links,
      videoLinks: videoLinks !== undefined ? videoLinks : profile.videoLinks,
      updatedAt: new Date().toISOString()
    };
    
    const { resource } = await container.item(handle, handle).replace(updated);
    if (!resource) throw new Error("Failed to update profile");

    return {
      status: 200,
      jsonBody: { success: true, profile: resource }
    };
  } catch (error: any) {
    context.error("Error updating profile:", error);
    return {
      status: 500,
      jsonBody: { error: error.message || "Failed to update profile" }
    };
  }
}

app.http("updateProfile", {
  methods: ["PUT", "PATCH"],
  authLevel: "anonymous",
  route: "updateProfile",
  handler: updateUserProfile
});

