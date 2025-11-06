import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getProfileByHandle } from './shared/cosmos';

export async function getProfile(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const handle = request.params.handle;

    if (!handle) {
      return {
        status: 400,
        jsonBody: { error: 'Handle is required' },
      };
    }

    const profile = await getProfileByHandle(handle);

    if (!profile || profile.status !== 'active') {
      return {
        status: 404,
        jsonBody: { error: 'Profile not found' },
      };
    }

    // Return public fields only
    const publicProfile = {
      handle: profile.handle,
      displayName: profile.displayName,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      theme: profile.theme,
      links: profile.links,
      videoLinks: profile.videoLinks,
    };

    return {
      status: 200,
      jsonBody: publicProfile,
    };
  } catch (error: any) {
    context.error('Error in getProfile:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' },
    };
  }
}

app.http('profile', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'profile/{handle}',
  handler: getProfile,
});


