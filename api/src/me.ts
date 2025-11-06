import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getUserId } from "./shared/auth";
import { getProfileByUserId } from "./shared/cosmos";

export async function me(req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return { status: 401, jsonBody: { error: "Unauthorized" } };
    }

    const profile = await getProfileByUserId(userId);
    
    if (!profile) {
      return { status: 404, jsonBody: { error: "Profile not found" } };
    }

    return {
      status: 200,
      jsonBody: profile
    };
  } catch (error: any) {
    context.error("Error fetching user profile:", error);
    return {
      status: 500,
      jsonBody: { error: "Failed to fetch profile" }
    };
  }
}

app.http("me", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "me",
  handler: me
});

