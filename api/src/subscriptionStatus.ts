import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { requireAuth, getUserId } from './shared/auth';
import { getProfileByUserId } from './shared/cosmos';

export async function subscriptionStatus(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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

    const subscription = profile.subscription || {
      tier: 'free',
      status: 'active',
    };

    return {
      status: 200,
      jsonBody: subscription,
    };
  } catch (error: any) {
    context.error('Error in subscriptionStatus:', error);
    return {
      status: error.message === 'Unauthorized' ? 401 : 500,
      jsonBody: { error: error.message || 'Internal server error' },
    };
  }
}

app.http('subscriptionStatus', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'subscription-status',
  handler: subscriptionStatus,
});


