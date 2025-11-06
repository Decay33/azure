import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

// Simple GET /api/ping
export async function ping(req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> {
  return {
    status: 200,
    jsonBody: { ok: true, message: "Hello from YSL Functions", time: new Date().toISOString() }
  };
}

app.http("ping", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: ping
});

