import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export const PAYMENT_LINK = 'plink_1Uf52S8c4pFptBOLKi3CupK4';
export const FORM_ID = '263267178301053';
export const hash = value => createHash('sha256').update(value).digest('hex');

export function sameSecret(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || !a || !b) return false;
  const left = Buffer.from(a), right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function validOrderReference(value) {
  return typeof value === 'string' && /^trv_[a-f0-9]{64}$/.test(value);
}

export function verifySignature(payload, header, secret, now = Date.now()) {
  if (typeof header !== 'string' || !secret) return false;
  const parts = header.split(',').map(part => part.trim().split('='));
  const timestamp = parts.find(([key]) => key === 't')?.[1];
  if (!/^\d+$/.test(timestamp || '') || Math.abs(now / 1000 - Number(timestamp)) > 300) return false;
  const expected = createHmac('sha256', secret).update(timestamp + '.' + payload).digest('hex');
  return parts.some(([key, value]) => key === 'v1' && sameSecret(value, expected));
}

export async function rawBody(req, limit = 1024 * 1024) {
  let total = 0;
  const chunks = [];
  for await (const chunk of req) {
    const bytes = Buffer.from(chunk);
    total += bytes.length;
    if (total > limit) throw new Error('Payload too large');
    chunks.push(bytes);
  }
  return Buffer.concat(chunks).toString('utf8');
}

export function origin() {
  const url = new URL(process.env.TRAVEL_PUBLIC_ORIGIN || (process.env.VERCEL_BRANCH_URL ? 'https://' + process.env.VERCEL_BRANCH_URL : ''));
  if (url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash || url.username || url.password) {
    throw new Error('Travel origin unavailable');
  }
  return url.origin;
}

export function sandboxOnly() {
  if (process.env.VERCEL_ENV === 'production') throw new Error('Sandbox unavailable in production');
}

export async function stripeGet(path) {
  sandboxOnly();
  const key = process.env.STRIPE_SECRET_KEY || '';
  if (!/^[sr]k_test_/.test(key)) throw new Error('Stripe sandbox API key unavailable');
  const response = await fetch('https://api.stripe.com/v1/' + path, {
    signal: AbortSignal.timeout(12000),
    headers: { Authorization: `Bearer ${key}`, 'Stripe-Version': '2026-11-18.endive' },
  });
  if (!response.ok) throw new Error('Stripe verification unavailable');
  const object = await response.json();
  if (object.livemode === true) throw new Error('Live Stripe object rejected');
  return object;
}

export function subscriptionId(object) {
  return object.subscription || object.parent?.subscription_details?.subscription || null;
}

export function eligible(order) {
  return order.paymentStatus === 'paid' && order.riskStatus === 'clear' &&
    order.billingStatus === 'active' && order.onboardingStatus === 'complete' &&
    order.fulfillmentStatus === 'not_started';
}

export function businessDeadline(start, days) {
  const date = new Date(start);
  while (days > 0) {
    date.setUTCDate(date.getUTCDate() + 1);
    if (![0, 6].includes(date.getUTCDay())) days--;
  }
  return date.toISOString();
}

export function allowedOrigin(value) {
  const allowed = [origin()];
  if (process.env.VERCEL_URL) allowed.push('https://' + process.env.VERCEL_URL);
  return allowed.includes(value);
}
