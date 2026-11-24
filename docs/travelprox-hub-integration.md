# TravelProX Marketing Hub integration contract

The existing travel sales page remains the entry point. Link to the stable feature preview's /travel/ while in sandbox. Preserve the existing return link to https://www.travelprox.com/marketing-hub/.

The customer-facing flow uses POST /api/travel-checkout and never takes prices, Stripe customer IDs, or billing return URLs from Hub visitors. Keep the referral source as optional analytics only. A referral, email match or form submission is not payment authorization.

No unrelated TravelProX project has been edited. No Hub account or entitlement is provisioned by this branch.

## Prepared server operations

A private trusted operator can POST to /api/travel-operations with Authorization: Bearer TRAVEL_OPERATIONS_SECRET and JSON containing checkoutSessionId and action (approve, start, deliver). Expected transitions are not_started → approved → in_progress → delivered. Each transition rechecks subscription/customer binding, requires complete onboarding and paid/unheld order state, and writes its audit entry and notification atomically.

The Hub must use server-side authentication and authorization for its owner or service account. Never put the operations secret, customer email, Stripe IDs, or private order references into a public Hub widget. Do not expose this operation through an unauthenticated browser proxy.

## Before automated Hub fulfillment

- Agree on the Hub's authenticated service identity, API base URL and order-owner mapping.
- Implement a durable consumer for approved orders with one provisioning job per checkoutSessionId.
- Add the remote job ID and state to the order through compare-and-set writes.
- Recheck authoritative payment, refund, dispute, and subscription state immediately before provisioning.
- Require a verified complete brief, approved scope and owner authorization.
- Implement retry/recovery without duplicate sites, accounts or resources.
- Define whether and how hosting is suspended only at paid-through expiry following cancellation. Never delete resources as a side effect of a webhook.
- Do not let a later renewal overwrite a refund or fraud hold.
- Exercise the sandbox contract and operator permissions before implementation in the Hub repository.
