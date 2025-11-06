import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import Stripe from 'stripe';
import { requireAuth, getUserId } from '../shared/auth';
import { getProfileByUserId } from '../shared/cosmos';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

export async function createPortalSession(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const principal = requireAuth(request);
    const userId = getUserId(principal);
    const email = principal.userDetails;

    const profile = await getProfileByUserId(userId);
    if (!profile) {
      return {
        status: 404,
        jsonBody: { error: 'Profile not found' },
      };
    }

    // In a real implementation, you'd store the Stripe customer ID in the profile
    // For now, we'll create a portal session with the email
    // Note: This requires the customer to exist in Stripe
    
    // First, find or create customer
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId: string;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      return {
        status: 400,
        jsonBody: { error: 'No subscription found. Please upgrade first.' },
      };
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    });

    return {
      status: 200,
      jsonBody: { url: session.url },
    };
  } catch (error: any) {
    context.error('Error in createPortalSession:', error);
    return {
      status: error.message === 'Unauthorized' ? 401 : 500,
      jsonBody: { error: error.message || 'Internal server error' },
    };
  }
}

app.http('createPortalSession', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'stripe/portal',
  handler: createPortalSession,
});


