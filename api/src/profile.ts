import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getProfileByHandle } from "./shared/cosmos";

export async function getProfile(req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const handle = req.params.handle;
    
    if (!handle) {
      return { status: 400, jsonBody: { error: "Handle is required" } };
    }

    const profile = await getProfileByHandle(handle);
    
    if (!profile) {
      return { status: 404, jsonBody: { error: "Profile not found" } };
    }

    return {
      status: 200,
      jsonBody: profile
    };
  } catch (error: any) {
    context.error("Error fetching profile:", error);
    return {
      status: 500,
      jsonBody: { error: "Failed to fetch profile" }
    };
  }
}

app.http("getProfile", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "profile/{handle}",
  handler: getProfile
});

