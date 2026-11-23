# Callista Digital travel funnel billing — sandbox implementation

## Already configured
- Stripe sandbox payment link combines $99 setup and $27 monthly hosting.
- Checkout redirects to Jotform onboarding at https://form.jotform.com/263267178301053.
- Stripe billing portal configuration enables end-of-term cancellation and payment method updates.
- Preview sales page includes delivery, cancellation and refund disclosures.

## Webhook staging endpoint
`POST /api/stripe-webhook` validates the raw Stripe signature using `STRIPE_WEBHOOK_SECRET`, rejects invalid signatures, limits request size, and currently returns HTTP 503 for valid events intentionally. **Do not register this endpoint for live traffic or assume events have been processed.** It is a secure scaffold, not a finished webhook. Returning 503 makes Stripe retry rather than incorrectly acknowledge unprocessed events.

## Remaining before enabling webhook
1. Choose durable storage for idempotent Stripe event IDs and order status, with restricted server-side access.
2. Implement verified handling of checkout.session.completed, checkout.session.async_payment_succeeded, checkout.session.async_payment_failed, invoice.paid, invoice.payment_failed, customer.subscription.updated, customer.subscription.deleted and refunds as appropriate. Check actual payment status, account and amount; do not fulfill based on browser redirect or Jotform submission alone.
3. Associate the Stripe Checkout Session with the onboarding submission without trusting customer-entered email alone.
4. Send owner/customer notifications through a configured transactional email service with consent and no secrets exposed.
5. Implement authenticated Stripe Customer Portal access or enable Stripe-hosted customer login as supported; never accept an arbitrary email address as proof of identity.
6. Add STRIPE_WEBHOOK_SECRET securely to Vercel Preview environment. Do not paste it into chat or commit it.
7. Register the **deployed preview** endpoint in the Stripe sandbox only after durable processing is implemented. Test webhook delivery and retries.
8. Activate Stripe live account separately, review tax and legal terms, and test live environment before merging.

## Commercial terms
$99 one-time setup fee; refundable in full if requested within 72 hours, even if work has started. $27/month hosting and routine maintenance, nonrefundable once billed except where required by law. Cancel at period end, with access until then. Typical delivery 5–7 business days after payment confirmation and complete project brief.
