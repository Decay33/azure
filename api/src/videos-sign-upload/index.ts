import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { randomUUID } from "crypto";
import { ZodError, z } from "zod";
import { authenticateRequest } from "../utils/auth";
import { badRequest, internalError, ok } from "../utils/http";
import { createSignedUploadUrl } from "../lib/storage";

const inputSchema = z.object({
  contentType: z.string().default("video/mp4"),
  fileExtension: z.string().regex(/^[a-z0-9]+$/i).default("mp4")
});

const handler: AzureFunction = async (context: Context, req: HttpRequest): Promise<void> => {
  try {
    const claims = await authenticateRequest(context, req);
    if (!claims?.sub) {
      return;
    }

    const userId = claims.sub;
    const payload = inputSchema.parse(req.body ?? {});

    if (!payload.contentType.startsWith("video/")) {
      badRequest(context, { error: "Content type must be a video mime type." });
      return;
    }

    const blobName = `backdrops/${userId}/${randomUUID()}.${payload.fileExtension.toLowerCase()}`;
    const expiresInMinutes = 15;

    const { uploadUrl, blobUrl } = await createSignedUploadUrl(blobName, expiresInMinutes);

    ok(context, {
      uploadUrl,
      blobUrl,
      expiresInMinutes,
      headers: {
        "x-ms-blob-type": "BlockBlob"
      }
    });
  } catch (error) {
    if (error instanceof ZodError) {
      badRequest(context, { error: error.flatten() });
      return;
    }

    internalError(context, error);
  }
};

export { handler };
