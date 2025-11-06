import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import Stripe from 'stripe';
import { getProfileByUserId, updateProfile } from '../shared/cosmos';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function stripeWebhook(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const sig = request.headers.get('stripe-signature');
    if (!sig) {
      return { status: 400, body: 'No signature' };
    }

    const body = await request.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (err: any) {
      context.error('Webhook signature verification failed:', err.message);
      return { status: 400, body: `Webhook Error: ${err.message}` };
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (userId) {
          const profile = await getProfileByUserId(userId);
          if (profile) {
            profile.subscription = {
              tier: 'creator',
              status: 'active',
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            };
            await updateProfile(profile);
            context.log(`Updated subscription for user ${userId} to creator`);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // In a real implementation, you'd need to look up the user by customer ID
        // For now, we'll log it
        context.log(`Subscription updated for customer ${customerId}:`, subscription.status);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // In a real implementation, you'd need to look up the user and downgrade them
        context.log(`Subscription canceled for customer ${customerId}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        context.log(`Payment failed for invoice ${invoice.id}`);
        break;
      }

      default:
        context.log(`Unhandled event type: ${event.type}`);
    }

    return {
      status: 200,
      body: 'ok',
    };
  } catch (error: any) {
    context.error('Error in stripeWebhook:', error);
    return {
      status: 500,
      body: error.message || 'Internal server error',
    };
  }
}

app.http('stripeWebhook', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'stripe/webhook',
  handler: stripeWebhook,
});


