import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { requireAuth, getUserId } from './shared/auth';
import { getProfileByUserId, updateProfile } from './shared/cosmos';
import { validateUrl, sanitizeString } from './shared/validation';

export async function updateProfileHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const principal = requireAuth(request);
    const userId = getUserId(principal);

    const profile = await getProfileByUserId(userId);
    if (!profile) {
      return {
        status: 404,
        jsonBody: { error: 'Profile not found' },
      };
    }

    const body: any = await request.json();

    // Update allowed fields
    if (body.displayName !== undefined) {
      profile.displayName = sanitizeString(body.displayName, 50);
    }

    if (body.bio !== undefined) {
      profile.bio = sanitizeString(body.bio, 200);
    }

    if (body.avatarUrl !== undefined) {
      profile.avatarUrl = body.avatarUrl;
    }

    if (body.theme !== undefined) {
      profile.theme = body.theme;
    }

    if (body.links !== undefined) {
      const maxLinks = profile.subscription?.tier === 'creator' ? 25 : 4;
      if (body.links.length > maxLinks) {
        return {
          status: 422,
          jsonBody: { error: `Maximum ${maxLinks} links allowed for your plan` },
        };
      }

      // Validate URLs
      for (const link of body.links) {
        if (link.url && !validateUrl(link.url)) {
          return {
            status: 400,
            jsonBody: { error: `Invalid URL: ${link.url}. URLs must use HTTPS.` },
          };
        }
        link.label = sanitizeString(link.label, 40);
      }

      profile.links = body.links;
    }

    if (body.videoLinks !== undefined) {
      const maxVideos = profile.subscription?.tier === 'creator' ? 8 : 3;
      if (body.videoLinks.length > maxVideos) {
        return {
          status: 422,
          jsonBody: { error: `Maximum ${maxVideos} video links allowed for your plan`, code: 'LIMIT_EXCEEDED' },
        };
      }

      // Validate URLs
      for (const video of body.videoLinks) {
        if (video.url && !validateUrl(video.url)) {
          return {
            status: 400,
            jsonBody: { error: `Invalid URL: ${video.url}. URLs must use HTTPS.` },
          };
        }
      }

      profile.videoLinks = body.videoLinks;
    }

    const updated = await updateProfile(profile);

    return {
      status: 200,
      jsonBody: updated,
    };
  } catch (error: any) {
    context.error('Error in updateProfile:', error);
    return {
      status: error.message === 'Unauthorized' ? 401 : 500,
      jsonBody: { error: error.message || 'Internal server error' },
    };
  }
}

app.http('updateProfile', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'profile/update',
  handler: updateProfileHandler,
});


