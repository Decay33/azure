import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { CosmosConfigError, getProfileByHandle } from "./shared/cosmos";

export async function checkHandle(req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const handle = req.params.handle;
    
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
    if (error instanceof CosmosConfigError) {
      context.error("Cosmos configuration error:", error.message);
      return {
        status: 500,
        jsonBody: { error: error.message }
      };
    }
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
  route: "check-handle/{handle}",
  handler: checkHandle
});

