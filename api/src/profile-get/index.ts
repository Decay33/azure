import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { notFound, ok, internalError } from "../utils/http";
import { getProfileByUsername } from "../store/profileStore";

const handler: AzureFunction = async (context: Context, _req: HttpRequest): Promise<void> => {
  void _req;
  try {
    const { username } = context.bindingData as { username?: string };

    if (!username) {
      notFound(context, "Username required.");
      return;
    }

    const profile = await getProfileByUsername(username);

    if (!profile) {
      notFound(context, { message: "Profile not found." });
      return;
    }

    ok(context, profile);
  } catch (error) {
    internalError(context, error);
  }
};

export { handler };
