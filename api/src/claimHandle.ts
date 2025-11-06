import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getUserId } from "./shared/auth";
import { createProfile, getProfileByUserId, getProfileByHandle } from "./shared/cosmos";
import { validateHandle } from "./shared/validation";

export async function claimHandle(req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return { status: 401, jsonBody: { error: "Unauthorized" } };
    }

    const body: any = await req.json();
    const { handle } = body;

    if (!handle || !validateHandle(handle)) {
      return { status: 400, jsonBody: { error: "Invalid handle format" } };
    }

    // Check if user already has a profile
    const existingUserProfile = await getProfileByUserId(userId);
    if (existingUserProfile) {
      return { status: 400, jsonBody: { error: "User already has a handle" } };
    }

    // Check if handle is taken - return 409 Conflict
    const existingHandle = await getProfileByHandle(handle);
    if (existingHandle) {
      return { status: 409, jsonBody: { error: "Handle already taken" } };
    }

    // Create profile with proper structure
    const profile = await createProfile({
      userId,
      handle,
      displayName: "",
      links: [],
      videoLinks: [],
      status: "active"
    });

    return {
      status: 200,
      jsonBody: { success: true, profile }
    };
  } catch (error: any) {
    context.error("Error claiming handle:", error);
    return {
      status: 500,
      jsonBody: { error: "Failed to claim handle" }
    };
  }
}

app.http("claimHandle", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "claimHandle",
  handler: claimHandle
});

