import { rawBody, sandboxOnly, verifySignature } from '../server/travel.js';
import { processEvent } from '../server/travel-events.js';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try { sandboxOnly(); } catch { return res.status(503).json({ error: 'Sandbox only' }); }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return res.status(503).json({ error: 'Webhook not configured' });
  let raw;
  try { raw = await rawBody(req); }
  catch { return res.status(413).json({ error: 'Invalid or oversized payload' }); }
  if (!verifySignature(raw, req.headers['stripe-signature'], secret)) {
    return res.status(400).json({ error: 'Invalid signature' });
  }
  let event;
  try { event = JSON.parse(raw); }
  catch { return res.status(400).json({ error: 'Invalid JSON' }); }
  if (event.livemode !== false) return res.status(400).json({ error: 'Sandbox events only' });
  try {
    const outcome = await processEvent(event);
    console.info('Stripe event recorded', { id: event.id, type: event.type, outcome });
    return res.status(200).json({ received: true });
  } catch {
    console.error('Stripe event processing unavailable', { id: event.id, type: event.type });
    return res.status(503).json({ error: 'Processing unavailable; Stripe should retry' });
  }
}
