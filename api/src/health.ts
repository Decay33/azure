import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

// GET /api/health  -> 200 OK with a JSON payload
export async function health(req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> {
  return {
    status: 200,
    jsonBody: {
      ok: true,
      service: "YourSocialLinks API",
      time: new Date().toISOString()
    }
  };
}

app.http("health", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: health
});

