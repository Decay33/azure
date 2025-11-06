import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { ZodError } from "zod";
import { authenticateRequest } from "../utils/auth";
import { badRequest, internalError, ok } from "../utils/http";
import { getProfileByUserId, upsertProfile } from "../store/profileStore";
import { replaceLinksForProfile } from "../store/linksStore";
import { linksInputSchema } from "../validation/schemas";

const handler: AzureFunction = async (context: Context, req: HttpRequest): Promise<void> => {
  try {
    const claims = await authenticateRequest(context, req);
    if (!claims?.sub) {
      return;
    }

    const userId = claims.sub;
    const profile =
      (await getProfileByUserId(userId)) ??
      (await upsertProfile(userId, { displayName: claims.name ?? "New Creator" }));

    if (req.method?.toUpperCase() === "GET") {
      ok(context, { links: profile.links });
      return;
    }

    if (req.method?.toUpperCase() === "POST") {
      const payload = linksInputSchema.parse(req.body ?? []);
      const updated = await replaceLinksForProfile(profile.id, userId, payload);
      ok(context, { links: updated });
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
