import { randomBytes } from 'node:crypto';
import { Firestore, retryConflict } from '../server/firestore.js';
import { hash, allowedOrigin, sandboxOnly, stripeGet, PAYMENT_LINK, FORM_ID, origin } from '../server/travel.js';
import { jotformGet } from '../server/jotform.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
  try {
    sandboxOnly();
    if (!process.env.STRIPE_SECRET_KEY || !process.env.JOTFORM_API_KEY) throw new Error('Verification not configured');

    if (!allowedOrigin(req.headers.origin)) return res.status(403).json({ error: 'Invalid origin' });
    const store = new Firestore();
    // Persisted limits survive cold starts. Vercel supplies this trusted client-IP header.
    const ip = req.headers['x-vercel-forwarded-for'];
    if (!ip) return res.status(503).json({ error: 'Checkout unavailable' });
    const window = Math.floor(Date.now() / 3600000);
    const bucket = hash(String(ip) + ':' + window);
    await retryConflict(async () => {
      const record = await store.get('travel_rate_limits', bucket);
      if ((record?.data.count || 0) >= 10) throw new Error('Rate limit');
      await store.commit([{ collection: 'travel_rate_limits', id: bucket,
        data: { count: (record?.data.count || 0) + 1, expiresAt: (window + 2) * 3600000 },
        version: record?.version }]);
    });
    const [link, questions] = await Promise.all([
      stripeGet('payment_links/' + PAYMENT_LINK), jotformGet('form/' + FORM_ID + '/questions'),
    ]);
    const redirect = origin() + '/api/travel-onboarding?session_id={CHECKOUT_SESSION_ID}';
    if (link.active !== true || link.after_completion?.type !== 'redirect' ||
        link.after_completion.redirect?.url !== redirect ||
        !Object.values(questions).some(question => question.name === 'orderReference') ||
        !Object.values(questions).some(question => question.required === 'Yes' && question.name !== 'orderReference')) {
      throw new Error('Onboarding not configured');
    }
    const reference = 'trv_' + randomBytes(32).toString('hex');
    await store.commit([{ collection: 'travel_references', id: hash(reference),
      data: { createdAt: new Date().toISOString(), checkoutSessionId: '' } }]);
    const checkout = new URL('https://buy.stripe.com/test_6oUdR30cmfmufxw9PIb7y00');
    checkout.searchParams.set('client_reference_id', reference);
    res.setHeader('Location', checkout.href);
    return res.status(303).end();
  } catch (error) {
    return res.status(error.message === 'Rate limit' ? 429 : 503).json({ error: 'Sandbox checkout unavailable. Please try later or contact hello@callistadigital.com.' });
  }
}
