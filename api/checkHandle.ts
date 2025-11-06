import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getProfileByHandle } from './shared/cosmos';
import { validateHandle } from './shared/validation';

export async function checkHandle(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const handle = request.params.handle;

    if (!handle) {
      return {
        status: 400,
        jsonBody: { available: false, error: 'Handle is required' },
      };
    }

    const validation = validateHandle(handle);
    if (!validation.valid) {
      return {
        status: 200,
        jsonBody: { available: false, error: validation.error },
      };
    }

    const existing = await getProfileByHandle(handle);

    return {
      status: 200,
      jsonBody: { available: !existing },
    };
  } catch (error: any) {
    context.error('Error in checkHandle:', error);
    return {
      status: 500,
      jsonBody: { available: false, error: 'Internal server error' },
    };
  }
}

app.http('checkHandle', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'check-handle/{handle}',
  handler: checkHandle,
});


