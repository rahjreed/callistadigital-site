# Callista Digital travel funnel billing — sandbox implementation

## Already configured
- Stripe sandbox payment link combines $99 setup and $27 monthly hosting.
- Checkout redirects to Jotform onboarding at https://form.jotform.com/263267178301053.
- Stripe billing portal configuration enables end-of-term cancellation and payment method updates.
- Preview sales page includes delivery, cancellation and refund disclosures.

## Webhook staging endpoint
`POST /api/stripe-webhook` validates the raw Stripe signature using `STRIPE_WEBHOOK_SECRET`, rejects invalid signatures, limits request size, and now records signed sandbox events atomically in Firebase Firestore and creates a travel order for a paid $126 checkout from the expected Stripe Payment Link. It responds 503 when storage is unavailable so Stripe can retry. **It has not been deployed and tested with credentials yet. Do not register a live webhook.**

## Remaining before enabling webhook
1. Firestore project `callista-digital` is selected. Set `FIREBASE_SERVICE_ACCOUNT_JSON` (complete service account JSON) and `STRIPE_WEBHOOK_SECRET` in Vercel Preview environment only, using Vercel secure settings. Never commit or paste credentials into chat. Provision service account with minimal Firestore permissions.
2. Checkout completed paid orders are implemented in sandbox; extend lifecycle reconciliation for asynchronous payments, recurring invoices, failed payments, cancellations, and refunds. Current other event types are stored for audit only, not acted upon.
3. Associate the Stripe Checkout Session with the onboarding submission without trusting customer-entered email alone.
4. Send owner/customer notifications through a configured transactional email service with consent and no secrets exposed.
5. Implement authenticated Stripe Customer Portal access or enable Stripe-hosted customer login as supported; never accept an arbitrary email address as proof of identity.
6. Add STRIPE_WEBHOOK_SECRET securely to Vercel Preview environment. Do not paste it into chat or commit it.
7. Deploy the preview endpoint and register it in the Stripe sandbox after secrets are set. Test webhook delivery, signature rejection, retries, and duplicate events.
8. Activate Stripe live account separately, review tax and legal terms, and test live environment before merging.

## Commercial terms
$99 one-time setup fee; refundable in full if requested within 72 hours, even if work has started. $27/month hosting and routine maintenance, nonrefundable once billed except where required by law. Cancel at period end, with access until then. Typical delivery 5–7 business days after payment confirmation and complete project brief.
