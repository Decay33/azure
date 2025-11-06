import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { requireAuth, getUserId } from './shared/auth';
import { getProfileByHandle, getProfileByUserId, createProfile, Profile } from './shared/cosmos';
import { validateHandle } from './shared/validation';

export async function claimHandle(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const principal = requireAuth(request);
    const userId = getUserId(principal);

    // Check if user already has a profile
    const existingProfile = await getProfileByUserId(userId);
    if (existingProfile) {
      return {
        status: 400,
        jsonBody: { error: 'You already have a profile' },
      };
    }

    const body: any = await request.json();
    const { handle, displayName } = body;

    // Validate handle
    const validation = validateHandle(handle);
    if (!validation.valid) {
      return {
        status: 400,
        jsonBody: { error: validation.error },
      };
    }

    // Check if handle is available
    const existingHandle = await getProfileByHandle(handle);
    if (existingHandle) {
      return {
        status: 409,
        jsonBody: { error: 'Handle is already taken' },
      };
    }

    // Create profile
    const newProfile: Profile = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      handle,
      displayName: displayName || handle,
      theme: {
        style: 'gradient',
        accent: '#8b5cf6',
      },
      links: [],
      videoLinks: [],
      status: 'active',
      subscription: {
        tier: 'free',
        status: 'active',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ttl: -1,
    };

    const profile = await createProfile(newProfile);

    return {
      status: 201,
      jsonBody: profile,
    };
  } catch (error: any) {
    context.error('Error in claimHandle:', error);
    return {
      status: error.message === 'Unauthorized' ? 401 : 500,
      jsonBody: { error: error.message || 'Internal server error' },
    };
  }
}

app.http('claimHandle', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: claimHandle,
});


