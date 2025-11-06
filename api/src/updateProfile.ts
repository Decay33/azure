import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getUserId } from "./shared/auth";
import { updateProfile } from "./shared/cosmos";

export async function updateUserProfile(req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return { status: 401, jsonBody: { error: "Unauthorized" } };
    }

    const body: any = await req.json();
    const { displayName, links, videoLinks } = body;

    const updates: any = {};
    if (displayName !== undefined) updates.displayName = displayName;
    if (links !== undefined) updates.links = links;
    if (videoLinks !== undefined) updates.videoLinks = videoLinks;

    const profile = await updateProfile(userId, updates);

    return {
      status: 200,
      jsonBody: { success: true, profile }
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

