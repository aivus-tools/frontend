import { waitForConfirmationLinkViaMailpit } from './mailpit';
import { waitForConfirmationLinkViaEndpoint } from './endpointTokenSource';

const SOURCE = (process.env.E2E_TOKEN_SOURCE ?? 'mailpit').toLowerCase();

// Returns the absolute /auth/confirm-email?token=... link for a freshly
// registered address. Local/staging-with-Mailpit reads the inbox API;
// staging-with-Resend reads the hard-gated backend endpoint. Switch with
// E2E_TOKEN_SOURCE=mailpit|endpoint.
export const waitForConfirmationLink = async (email: string, timeoutMs = 90_000): Promise<string> => {
  if (SOURCE === 'endpoint') {
    return waitForConfirmationLinkViaEndpoint(email, timeoutMs);
  }
  return waitForConfirmationLinkViaMailpit(email, timeoutMs);
};
