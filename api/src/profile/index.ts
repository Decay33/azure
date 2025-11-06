import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { ZodError } from "zod";
import { authenticateRequest } from "../utils/auth";
import { badRequest, internalError, ok } from "../utils/http";
import { ensureUserDocument } from "../store/userStore";
import { getProfileByUserId, upsertProfile } from "../store/profileStore";
import { profileInputSchema } from "../validation/schemas";

const handler: AzureFunction = async (context: Context, req: HttpRequest): Promise<void> => {
  try {
    const claims = await authenticateRequest(context, req);
    if (!claims?.sub) {
      return;
    }

    const userId = claims.sub;
    const email = Array.isArray(claims.emails) ? claims.emails[0] : undefined;
    const name = typeof claims.name === "string" ? claims.name : undefined;

    await ensureUserDocument(userId, { email, name });

    if (req.method?.toUpperCase() === "GET") {
      const profile = await getProfileByUserId(userId);
      if (profile) {
        ok(context, profile);
        return;
      }

      const created = await upsertProfile(userId, {
        displayName: name ?? email ?? "New Creator"
      });
      ok(context, created);
      return;
    }

    if (req.method?.toUpperCase() === "POST") {
      const payload = profileInputSchema.parse(req.body ?? {});

      const profile = await upsertProfile(userId, {
        displayName: payload.displayName ?? name ?? email ?? "Creator",
        bio: payload.bio,
        username: payload.username?.toLowerCase(),
        avatarUrl: payload.avatarUrl,
        backgroundVideos: payload.backdrops,
        theme: payload.theme,
        social: payload.social
      });

      ok(context, profile);
      return;
    }

    context.res = {
      status: 405,
      headers: {
        Allow: "GET, POST"
      },
      body: "Method not allowed"
    };
  } catch (error) {
    if (error instanceof ZodError) {
      badRequest(context, { error: error.flatten() });
      return;
    }

    internalError(context, error);
  }
};

export { handler };
