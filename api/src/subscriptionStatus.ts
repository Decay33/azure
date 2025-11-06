import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getUserId } from "./shared/auth";
import { CosmosConfigError, getProfileByUserId } from "./shared/cosmos";

export async function subscriptionStatus(req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return { status: 401, jsonBody: { error: "Unauthorized" } };
    }

    const profile = await getProfileByUserId(userId);
    
    if (!profile) {
      return {
        status: 200,
        jsonBody: {
          tier: "free",
          status: "active"
        }
      };
    }

    return {
      status: 200,
      jsonBody: {
        tier: profile.subscriptionTier || "free",
        status: profile.subscriptionStatus || "active",
        customerId: profile.stripeCustomerId
      }
    };
  } catch (error: any) {
    if (error instanceof CosmosConfigError) {
      context.error("Cosmos configuration error:", error.message);
      return {
        status: 500,
        jsonBody: { error: error.message }
      };
    }
    context.error("Error fetching subscription status:", error);
    return {
      status: 500,
      jsonBody: { error: "Failed to fetch subscription status" }
    };
  }
}

app.http("subscriptionStatus", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "subscriptionStatus",
  handler: subscriptionStatus
});

