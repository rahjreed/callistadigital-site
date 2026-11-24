import { verifyOriginalPayment } from '../server/travel-payment.js';
import { Firestore, retryConflict } from '../server/firestore.js';
import { eligible, rawBody, sameSecret, sandboxOnly, stripeGet } from '../server/travel.js';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
  const secret = process.env.TRAVEL_OPERATIONS_SECRET;
  if (!secret || !sameSecret(req.headers.authorization, 'Bearer ' + secret)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    sandboxOnly();
    const { checkoutSessionId, action } = JSON.parse(await rawBody(req, 4096));
    if (!/^cs_test_[A-Za-z0-9]{20,200}$/.test(checkoutSessionId || '') ||
        !['approve', 'start', 'deliver'].includes(action)) return res.status(400).json({ error: 'Invalid operation' });
    const store = new Firestore();
    const outcome = await retryConflict(async () => {
      const order = await store.get('travel_orders', checkoutSessionId);
      if (!order) throw new Error('Order unavailable');
      const data = order.data;
      const subscription = await stripeGet('subscriptions/' + encodeURIComponent(data.subscriptionId));
      if (subscription.status !== 'active' || subscription.customer !== data.customerId ||
          data.paymentStatus !== 'paid' || data.riskStatus !== 'clear' ||
          data.onboardingStatus !== 'complete') throw new Error('Order blocked');
      await verifyOriginalPayment(data);
      const expected = { approve: 'not_started', start: 'approved', deliver: 'in_progress' };
      const next = { approve: 'approved', start: 'in_progress', deliver: 'delivered' };
      if (data.fulfillmentStatus === next[action]) return 'duplicate';
      if (data.fulfillmentStatus !== expected[action]) throw new Error('Invalid transition');
      if (action === 'approve' && !eligible(data)) throw new Error('Order not eligible');
      // Owner review includes the business brief, refund/dispute state, and scope.
      const now = new Date().toISOString();
      await store.commit([
        { collection: 'travel_orders', id: order.id, version: order.version,
          data: { ...data, fulfillmentStatus: next[action], updatedAt: now } },
        { collection: 'travel_operations', id: order.id + '_' + action,
          data: { checkoutSessionId: order.id, action, at: now } },
        { collection: 'travel_notifications', id: order.id + '_' + action,
          data: { kind: next[action], checkoutSessionId: order.id,
            customerEmail: data.customerEmail, status: 'pending', createdAt: now } },
      ]);
      return next[action];
    });
    return res.status(200).json({ status: outcome });
  } catch { return res.status(409).json({ error: 'Order not eligible or verification unavailable' }); }
}
