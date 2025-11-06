import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { requireAuth, getUserId } from './shared/auth';
import { getProfileByUserId } from './shared/cosmos';

export async function me(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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

    return {
      status: 200,
      jsonBody: profile,
    };
  } catch (error: any) {
    context.error('Error in me:', error);
    return {
      status: error.message === 'Unauthorized' ? 401 : 500,
      jsonBody: { error: error.message || 'Internal server error' },
    };
  }
}

app.http('me', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: me,
});


