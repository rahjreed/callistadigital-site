import { Firestore } from '../server/firestore.js';
import { rawBody, hash, validOrderReference, sandboxOnly } from '../server/travel.js';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
  try {
    sandboxOnly();
    const { orderReference } = JSON.parse(await rawBody(req, 4096));
    if (!validOrderReference(orderReference)) return res.status(404).json({ error: 'Order unavailable' });
    const store = new Firestore();
    const reference = await store.get('travel_references', hash(orderReference));
    if (!reference?.data.checkoutSessionId) return res.status(404).json({ error: 'Order unavailable' });
    const order = await store.get('travel_orders', reference.data.checkoutSessionId);
    if (!order) return res.status(404).json({ error: 'Order unavailable' });
    const data = order.data;
    return res.status(200).json({
      paymentStatus: data.paymentStatus, onboardingStatus: data.onboardingStatus,
      billingStatus: data.billingStatus, fulfillmentStatus: data.fulfillmentStatus,
      deliveryWindowStart: data.deliveryWindowStart || null, deliveryWindowEnd: data.deliveryWindowEnd || null,
      setupRefundRequestDeadline: data.setupRefundRequestDeadline || null,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
    });
  } catch { return res.status(503).json({ error: 'Order tracking unavailable' }); }
}
