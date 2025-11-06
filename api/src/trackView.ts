import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { logEvent, Event } from './shared/cosmos';

// Simple in-memory throttle (in production, use Redis or similar)
const viewThrottle = new Map<string, number>();
const THROTTLE_MS = 60000; // 1 minute

export async function trackView(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const body: any = await request.json();
    const { handle } = body;

    if (!handle) {
      return { status: 400, jsonBody: { error: 'Handle is required' } };
    }

    // Get IP for throttling
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const throttleKey = `${handle}:${ip}`;

    // Check throttle
    const lastView = viewThrottle.get(throttleKey);
    if (lastView && Date.now() - lastView < THROTTLE_MS) {
      return { status: 200, jsonBody: { status: 'throttled' } };
    }

    // Filter bots
    const userAgent = request.headers.get('user-agent') || '';
    const botPatterns = ['bot', 'crawler', 'spider', 'scraper'];
    const isBot = botPatterns.some(pattern => userAgent.toLowerCase().includes(pattern));

    if (isBot) {
      return { status: 200, jsonBody: { status: 'bot' } };
    }

    // Log event
    const event: Event = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      handle,
      type: 'view',
      ts: new Date().toISOString(),
      ua: userAgent,
      ref: request.headers.get('referer') || undefined,
    };

    await logEvent(event);

    // Update throttle
    viewThrottle.set(throttleKey, Date.now());

    // Cleanup old throttle entries (basic, consider a proper cache in production)
    if (viewThrottle.size > 10000) {
      const now = Date.now();
      for (const [key, timestamp] of viewThrottle.entries()) {
        if (now - timestamp > THROTTLE_MS * 2) {
          viewThrottle.delete(key);
        }
      }
    }

    return {
      status: 200,
      jsonBody: { status: 'logged' },
    };
  } catch (error: any) {
    context.error('Error in trackView:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' },
    };
  }
}

app.http('trackView', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: trackView,
});


