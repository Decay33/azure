import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { CosmosConfigError, getProfileByHandle, updateProfile as updateProfileDocument } from "./shared/cosmos";

export async function updateUserProfile(req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const body: any = await req.json();
    const { handle, displayName, links, videoLinks } = body;
    
    if (!handle) {
      return { status: 400, jsonBody: { error: "Handle is required" } };
    }

    // Find profile by handle (partition key)
    const profile = await getProfileByHandle(handle);
    
    if (!profile) {
      return { status: 404, jsonBody: { error: "Profile not found" } };
    }

    const updated = await updateProfileDocument(profile.userId, {
      displayName: displayName !== undefined ? displayName : profile.displayName,
      links: links !== undefined ? links : profile.links,
      videoLinks: videoLinks !== undefined ? videoLinks : profile.videoLinks
    });

    return {
      status: 200,
      jsonBody: { success: true, profile: updated }
    };
  } catch (error: any) {
    if (error instanceof CosmosConfigError) {
      context.error("Cosmos configuration error:", error.message);
      return {
        status: 500,
        jsonBody: { error: error.message }
      };
    }
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

