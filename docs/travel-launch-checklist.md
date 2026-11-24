# Travel funnel sandbox readiness and launch checklist

This branch extends the existing Payment Link, pricing, travel page, and Firebase project. It is sandbox-only. All API handlers refuse Vercel Production. The insecure Gemini endpoint remains absent.

## Verified baseline on November 23, 2026 (America/Indianapolis)

Read-only Firebase console inspection independently confirmed one signed sandbox checkout event in stripe_events and its travel_orders record. The order has paymentStatus paid, onboardingStatus awaiting_submission, setupAmount 9900, firstMonthAmount 2700, currency usd, and populated Stripe customer/subscription IDs. No customer details or private order IDs are copied here. Existing records have no unique reference and must not be auto-fulfilled.

Vercel's environment-variable page showed FIREBASE_SERVICE_ACCOUNT_JSON and STRIPE_WEBHOOK_SECRET as sensitive Preview variables restricted to feature/travelprox-travel-services. No Stripe read key, Jotform read key, operations secret, or notification configuration was present. Secret values were never revealed. Separately, the existing Stripe sandbox portal was inspected: payment updates, invoice history and end-of-period cancellation are enabled; plan/quantity changes are disabled. Its authenticated test login link was activated and is the sandbox default in the billing endpoint.

The Jotform builder redirected this browser to the public form. The form has an optional checkout session ID field but no orderReference field. Editing requires authenticated Jotform access.

## Current flow

1. POST /api/travel-checkout refuses checkout until the verification keys, authenticated form schema and exact sandbox after-payment redirect are configured, checks an allowed origin, applies a persisted per-IP hourly limit, creates a cryptographically random reference and stores only its hash, then redirects to the existing sandbox Payment Link with client_reference_id.
2. Stripe webhook signatures are checked on the raw request body, within a five-minute tolerance. Live events are rejected.
3. Completed/async-success checkouts are fetched from Stripe and verified against the expected Payment Link, paid USD 126 total, monthly USD 27 subscription, customer, and unique pending reference. The paid order, event receipt and notification outbox are committed atomically.
4. Stripe redirects to /api/travel-onboarding?session_id={CHECKOUT_SESSION_ID}. This must replace the current direct Jotform redirect in the sandbox Payment Link. The gateway waits for the durable order, checks payment/risk, then prefills Jotform's orderReference.
5. A trusted relay can POST {"submissionId":"..."} to /api/travel-onboarding-webhook with Authorization: Bearer TRAVEL_ONBOARDING_WEBHOOK_SECRET. Alternatively, a trusted scheduler calls POST /api/travel-sync using TRAVEL_OPERATIONS_SECRET; this polls the latest 100 submissions directly and requires no unsigned public webhook.
6. The server reads submissions and required-question schema using Jotform's API. It requires the exact form, ACTIVE status, one orderReference answer, required answers, a matching paid order and current active Stripe subscription. Duplicate submissions are handled atomically. Before accepting the brief the server rereads the original invoice, its payment intents and charges, rejecting refunded, disputed, uncaptured, review-held, fraudulent or elevated-risk charges. The first complete submission starts the 5–7 weekday window. Weekends are excluded; a holiday calendar is not implemented.
7. Customer status lookup uses POST /api/travel-order with the private reference in the JSON body. It returns no email, customer ID, subscription ID or brief. References are bearer secrets and must not enter analytics or logs.
8. Fulfillment requires an authenticated owner operation to approve, then start, then deliver. No submission automatically creates hosting, DNS, a website, or a Marketing Hub account.
9. Billing redirects to Stripe's authenticated sandbox customer portal login. Stripe verifies the billing email. Neither customer-entered email nor the onboarding reference authorizes billing access.
10. Customer and owner messages are queued atomically. POST /api/travel-notifications sends up to 20 pending jobs to an explicitly configured HTTPS transactional-delivery adapter with a stable Idempotency-Key. Configure a durable idempotent receiver before scheduling this endpoint. This repository does not provision an email provider or a scheduler.

## Additional Preview configuration required

Add variables only for this branch. Sensitive values stay in Vercel and never in chat or Git.

- STRIPE_SECRET_KEY — sandbox restricted key with read access to Payment Links, Checkout Sessions, subscriptions, invoices, InvoicePayments, charges and PaymentIntents.
- JOTFORM_API_KEY — read access to form 263267178301053, questions and submissions.
- STRIPE_CUSTOMER_PORTAL_URL — optional override for the verified default Stripe-generated https://billing.stripe.com/p/login/test_... URL from the existing sandbox portal configuration. Enable hosted login, invoice history, payment updates, and cancellation at period end. Do not permit plan/quantity changes.
- TRAVEL_OPERATIONS_SECRET — strong random bearer secret for the trusted scheduler/operator.
- TRAVEL_ONBOARDING_WEBHOOK_SECRET — strong random bearer secret only if using a trusted webhook relay.
- TRAVEL_PUBLIC_ORIGIN — stable HTTPS branch preview origin. VERCEL_BRANCH_URL is used when unset; the immutable VERCEL_URL is also allowed for checkout origin verification.
- TRAVEL_NOTIFICATION_ENDPOINT and TRAVEL_NOTIFICATION_ORIGIN — exact HTTPS delivery adapter URL and allowlisted origin.
- TRAVEL_NOTIFICATION_SECRET — delivery adapter bearer credential.
- TRAVEL_OWNER_EMAIL — verified owner recipient.
- No new notification service has been selected or configured in this task yet.

## Jotform / Stripe dashboard work

- Add a hidden Short Text question whose unique name is orderReference. Never use email or the optional checkout-session field as authorization.
- Mark the actual required business-brief questions required. The backend rejects a schema with zero required questions and refuses missing required answers.
- Change only the sandbox Payment Link's after-payment redirect to the stable preview gateway described above.
- Enable checkout.session.completed and checkout.session.async_payment_succeeded.
- Enable invoice.paid, invoice.payment_failed, invoice.payment_action_required, customer.subscription.updated, customer.subscription.deleted, charge.refunded, charge.dispute.created, charge.dispute.closed, radar.early_fraud_warning.created.
- Keep the verified webhook signing secret when retaining the existing destination. A different destination requires its own signing secret.
- Reconcile legacy orders manually. Do not retroactively trust an existing email or arbitrary session field. Reference-free paid orders remain recorded but ineligible for onboarding acceptance until a secure migration is implemented.

## Lifecycle and retry behavior

- Each event receipt is conditional on nonexistence, and every order update uses its prior updateTime. Only an already-present event is called a duplicate. Other conflicts retry; failures return 503 for Stripe retries.
- Subscription and invoice events reread the current subscription so stale payment-failure events cannot overwrite a recovered subscription. Billing state and cancellation-at-period-end are independent of initial payment state.
- Refunds place the order into refund_review and a risk hold. Dispute/fraud events place it on hold even when a dispute closes. Owner reconciliation is required to release a hold. These changes never issue a refund or charge.
- If a refund/dispute cannot be mapped through a charge to an invoice/subscription, processing fails closed with 503 for reconciliation. The adapter follows direct charge.invoice, legacy PaymentIntent.invoice, and modern InvoicePayment relationships. Ambiguous or paginated payment mappings require owner reconciliation. Live compatibility still needs sandbox verification.
- A subscription event received before its order exists is retried.
- Unrelated signed events are stored for audit. Do not subscribe this endpoint to unrelated projects' events.
- There is no automated offboarding/provisioning consumer. Hosting continues to require an owner-approved operational process; cancellation records do not delete customer resources.
- The notification adapter must durably deduplicate each notificationId before sending both recipients, including the crash-after-send retry case. A mere HTTP 200 from a non-idempotent email proxy is insufficient.
- Rate-limit documents include expiresAt in milliseconds. Configure retention cleanup. No TTL policy or Firestore public rules were modified.

## Production launch gates

- [ ] Select and verify the email sender/domain, owner recipient and durable notification adapter.
- [ ] Configure required branch variables and Jotform field/schema.
- [ ] Configure the sandbox after-payment redirect, portal login, webhook event subscriptions and trusted scheduler.
- [ ] Pay USD 126 using a test card, then independently verify the new order/reference/event/outbox in Firestore.
- [ ] Complete onboarding; verify the fetched submission binds to exactly one order and that delivery dates begin only then.
- [ ] Verify customer and owner message delivery, duplicates and crash/retry idempotency.
- [ ] Verify authorized portal login, wrong-email denial, payment update, period-end cancellation, and cancellation recovery.
- [ ] Exercise renewal success, failure, recovery, refund of setup within 72 hours, partial refund, dispute, early fraud warning, duplicate IDs and out-of-order events against Stripe and Firestore.
- [ ] Verify modern InvoicePayment refund/dispute mapping in Stripe and implement paginated historical onboarding reconciliation.
- [ ] Validate Firestore least-privilege IAM and deny browser access to orders/references/events/outbox.
- [ ] Validate customer data retention, privacy/consent and notification unsubscribe categories.
- [ ] Implement authenticated operator UI and safe Marketing Hub provisioning/offboarding before promising automatic fulfillment.
- [ ] Owner review of launch checklist, pricing, scope, refund policy and delivery terms.
- [ ] Separate implementation/review to enable live mode, configure live products/prices/portal/webhooks and production credentials. Current handlers deliberately reject Production.
- [ ] Explicit approval before main merge or any live payment activation.

## Verification boundary

The local tests use an atomic in-memory Firestore test double and simulated Stripe/Jotform objects. They exercise application behavior but do not establish real Stripe or Firestore API compatibility. Dashboard verification of the historical payment is read-only evidence. Missing credentials, dashboard edits, a delivery adapter and live sandbox scenarios prevent an end-to-end pass or a production-ready claim.
