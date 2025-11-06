import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getUserId } from "./shared/auth";
import { createProfile, getProfileByUserId, getProfileByHandle } from "./shared/cosmos";
import { validateHandle } from "./shared/validation";

export async function claimHandle(req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    context.log("=== CLAIM HANDLE DEBUG ===");
    context.log("COSMOS_ENDPOINT:", process.env.COSMOS_ENDPOINT ? "SET" : "MISSING");
    context.log("COSMOS_KEY:", process.env.COSMOS_KEY ? "SET" : "MISSING");
    context.log("COSMOS_DB:", process.env.COSMOS_DB);
    context.log("COSMOS_PROFILES:", process.env.COSMOS_PROFILES);
    
    let userId = getUserId(req);
    if (!userId) {
      // TEMP: Generate test user ID since auth is disabled
      userId = "test-user-" + Date.now();
      context.log("No auth, using temp userId:", userId);
    } else {
      context.log("UserId from auth:", userId);
    }

    const body: any = await req.json();
    const { handle } = body;
    context.log("Requested handle:", handle);

    if (!handle || !validateHandle(handle)) {
      return { status: 400, jsonBody: { error: "Invalid handle format" } };
    }

    // Check if user already has a profile
    context.log("Checking if user already has profile...");
    const existingUserProfile = await getProfileByUserId(userId);
    if (existingUserProfile) {
      context.log("User already has handle:", existingUserProfile.handle);
      return { status: 400, jsonBody: { error: "User already has a handle" } };
    }

    // Check if handle is taken - return 409 Conflict
    context.log("Checking if handle is available...");
    const existingHandle = await getProfileByHandle(handle);
    if (existingHandle) {
      context.log("Handle already taken by userId:", existingHandle.userId);
      return { status: 409, jsonBody: { error: "Handle already taken" } };
    }

    // Create profile with proper structure
    context.log("Creating new profile...");
    const profile = await createProfile({
      userId,
      handle,
      displayName: "",
      links: [],
      videoLinks: [],
      status: "active"
    });

    context.log("Profile created successfully:", profile.id);
    return {
      status: 200,
      jsonBody: { success: true, profile }
    };
  } catch (error: any) {
    context.error("=== ERROR CLAIMING HANDLE ===");
    context.error("Error message:", error.message);
    context.error("Error stack:", error.stack);
    context.error("Error code:", error.code);
    context.error("Full error:", JSON.stringify(error, null, 2));
    return {
      status: 500,
      jsonBody: { 
        error: "Failed to claim handle",
        details: error.message,
        code: error.code
      }
    };
  }
}

app.http("claimHandle", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "claimHandle",
  handler: claimHandle
});

