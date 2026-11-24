import { sandboxOnly } from '../server/travel.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Referrer-Policy', 'no-referrer');
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET required' });
  try {
    sandboxOnly();
    // Stripe sends a verification code to the customer's billing email.
    // No email, customer ID, order token, or return URL supplied by callers is trusted.
    const url = new URL(process.env.STRIPE_CUSTOMER_PORTAL_URL ||
      'https://billing.stripe.com/p/login/test_6oUdR30cmfmufxw9PIb7y00');
    if (url.origin !== 'https://billing.stripe.com' || !url.pathname.startsWith('/p/login/test_') ||
        url.username || url.password || url.search || url.hash) throw new Error('Invalid portal configuration');
    res.setHeader('Location', url.href);
    return res.status(303).end();
  } catch { return res.status(503).json({ error: 'Sandbox billing portal is being configured. Contact hello@callistadigital.com for cancellation or billing help.' }); }
}
