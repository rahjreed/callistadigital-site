import { Firestore } from '../server/firestore.js';
import { FORM_ID, PAYMENT_LINK, hash, validOrderReference, stripeGet, sandboxOnly } from '../server/travel.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Referrer-Policy', 'no-referrer');
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET required' });
  const id = req.query?.session_id;
  if (typeof id !== 'string' || !/^cs_test_[a-zA-Z0-9]{20,200}$/.test(id)) {
    return res.status(400).json({ error: 'A verified sandbox checkout is required' });
  }
  try {
    sandboxOnly();
    const session = await stripeGet('checkout/sessions/' + encodeURIComponent(id));
    if (session.payment_link !== PAYMENT_LINK || session.payment_status !== 'paid' ||
        session.amount_total !== 12600 || session.currency !== 'usd' ||
        !validOrderReference(session.client_reference_id)) {
      return res.status(403).json({ error: 'Checkout not eligible for onboarding' });
    }
    const store = new Firestore();
    const pending = await store.get('travel_references', hash(session.client_reference_id));
    const order = await store.get('travel_orders', id);
    if (!pending || !order) return res.status(409).json({ error: 'Payment confirmation is processing. Refresh shortly.' });
    if (order.data.paymentStatus !== 'paid' || order.data.riskStatus !== 'clear') {
      return res.status(403).json({ error: 'Order requires owner review' });
    }
    const url = new URL('https://form.jotform.com/' + FORM_ID);
    url.searchParams.set('orderReference', session.client_reference_id);
    res.setHeader('Location', url.href);
    return res.status(303).end();
  } catch { return res.status(503).json({ error: 'Onboarding verification temporarily unavailable' }); }
}
