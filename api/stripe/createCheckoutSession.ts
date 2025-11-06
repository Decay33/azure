import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import Stripe from 'stripe';
import { requireAuth } from '../shared/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function createCheckoutSession(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const principal = requireAuth(request);
    const email = principal.userDetails;

    const body: any = await request.json();
    const { tier } = body;

    if (tier !== 'creator') {
      return {
        status: 400,
        jsonBody: { error: 'Invalid tier' },
      };
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_CREATOR,
          quantity: 1,
        },
      ],
      customer_email: email,
      success_url: `${process.env.FRONTEND_URL}/dashboard?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard?canceled=true`,
      metadata: {
        userId: `${principal.identityProvider}:${principal.userId}`,
      },
    });

    return {
      status: 200,
      jsonBody: { url: session.url },
    };
  } catch (error: any) {
    context.error('Error in createCheckoutSession:', error);
    return {
      status: error.message === 'Unauthorized' ? 401 : 500,
      jsonBody: { error: error.message || 'Internal server error' },
    };
  }
}

app.http('createCheckoutSession', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'stripe/createCheckoutSession',
  handler: createCheckoutSession,
});


