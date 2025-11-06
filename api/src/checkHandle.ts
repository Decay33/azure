import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getProfileByHandle } from "./shared/cosmos";

export async function checkHandle(req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const handle = req.query.get('handle');
    
    if (!handle) {
      return { status: 400, jsonBody: { error: "Handle is required" } };
    }

    const existingProfile = await getProfileByHandle(handle);
    const available = !existingProfile;

    return {
      status: 200,
      jsonBody: { available }
    };
  } catch (error: any) {
    context.error("Error checking handle:", error);
    return {
      status: 500,
      jsonBody: { error: "Failed to check handle availability" }
    };
  }
}

app.http("checkHandle", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "checkHandle",
  handler: checkHandle
});

