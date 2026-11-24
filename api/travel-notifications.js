import { confirmation } from '../server/travel-notifications.js';
import { Firestore, retryConflict } from '../server/firestore.js';
import { sameSecret, sandboxOnly, origin } from '../server/travel.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
  const secret = process.env.TRAVEL_OPERATIONS_SECRET;
  if (!secret || !sameSecret(req.headers.authorization, 'Bearer ' + secret)) return res.status(401).json({ error: 'Unauthorized' });
  try {
    sandboxOnly();
    const endpoint = new URL(process.env.TRAVEL_NOTIFICATION_ENDPOINT || '');
    const approvedOrigin = process.env.TRAVEL_NOTIFICATION_ORIGIN;
    if (endpoint.protocol !== 'https:' || endpoint.origin !== approvedOrigin ||
        endpoint.username || endpoint.password || endpoint.hash || endpoint.search ||
        !process.env.TRAVEL_NOTIFICATION_SECRET) throw new Error('Notifications not configured');
    if (!process.env.TRAVEL_OWNER_EMAIL) throw new Error('Owner recipient not configured');
    const store = new Firestore();
    const jobs = await store.find('travel_notifications', 'status', 'pending');
    let delivered = 0;
    for (const job of jobs.slice(0, 20)) {
      const order = await store.get('travel_orders', job.data.checkoutSessionId);
      if (!order) throw new Error('Order unavailable');
      const message = confirmation(job.data, order.data, origin());
      // Receiver MUST durably deduplicate this key before sending customer and owner email.
      const response = await fetch(endpoint, {
        method: 'POST', redirect: 'error', signal: AbortSignal.timeout(10000),
        headers: {
          'Content-Type': 'application/json', 'Idempotency-Key': job.id,
          Authorization: 'Bearer ' + process.env.TRAVEL_NOTIFICATION_SECRET,
        },
        body: JSON.stringify({ notificationId: job.id, customerEmail: order.data.customerEmail,
          ownerEmail: process.env.TRAVEL_OWNER_EMAIL, ...message }),
      });
      if (!response.ok) throw new Error('Notification delivery failed');
      await retryConflict(async () => {
        const current = await store.get('travel_notifications', job.id);
        if (current.data.status === 'delivered') return;
        await store.commit([{ collection: 'travel_notifications', id: job.id, version: current.version,
          data: { ...current.data, status: 'delivered', deliveredAt: new Date().toISOString() } }]);
      });
      delivered++;
    }
    return res.status(200).json({ delivered });
  } catch { return res.status(503).json({ error: 'Notification delivery unavailable; jobs remain retryable' }); }
}
