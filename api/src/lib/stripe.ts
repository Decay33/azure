import Stripe from "stripe";
import { config } from "../config";

let stripeClient: Stripe | null = null;

export const getStripeClient = (): Stripe => {
  if (stripeClient) {
    return stripeClient;
  }

  const { secretKey } = config.stripe;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is required to use Stripe.");
  }

  stripeClient = new Stripe(secretKey, {
    apiVersion: "2023-10-16",
    typescript: true
  });

  return stripeClient;
};
