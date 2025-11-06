// This file imports all function modules to ensure they are registered
// Azure Functions v4 programming model auto-registers functions when imported

import './claimHandle';
import './checkHandle';
import './me';
import './profile';
import './updateProfile';
import './subscriptionStatus';
import './trackView';
import './stripe/createCheckoutSession';
import './stripe/webhook';
import './stripe/portal';
import './ping';
import './health';

export {};

