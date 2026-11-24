import { verifyOriginalPayment } from './travel-payment.js';
import { FORM_ID, hash, validOrderReference, businessDeadline, stripeGet } from './travel.js';
import { retryConflict } from './firestore.js';

export function submissionReference(submission) {
  if (String(submission.form_id) !== FORM_ID || submission.status !== 'ACTIVE') throw new Error('Invalid submission');
  const matches = Object.values(submission.answers || {}).filter(answer => answer.name === 'orderReference');
  if (matches.length !== 1 || !validOrderReference(matches[0].answer)) throw new Error('Missing order reference');
  return matches[0].answer;
}

export async function acceptSubmission(submission, store, getStripe = stripeGet) {
  const reference = submissionReference(submission);
  const id = String(submission.id);
  if (!/^\d{10,40}$/.test(id)) throw new Error('Invalid submission ID');
  return retryConflict(async () => {
    const duplicate = await store.get('travel_submissions', id);
    if (duplicate) return 'duplicate';
    const pending = await store.get('travel_references', hash(reference));
    if (!pending?.data.checkoutSessionId) throw new Error('Payment not confirmed');
    const order = await store.get('travel_orders', pending.data.checkoutSessionId);
    if (!order || order.data.orderReferenceHash !== hash(reference) ||
        order.data.paymentStatus !== 'paid' || order.data.riskStatus !== 'clear' ||
        order.data.onboardingStatus !== 'awaiting_submission') throw new Error('Order not eligible');
    const subscription = await getStripe('subscriptions/' + encodeURIComponent(order.data.subscriptionId));
    if (subscription.status !== 'active' || subscription.customer !== order.data.customerId) {
      throw new Error('Billing not active');
    }
    await verifyOriginalPayment(order.data, getStripe);
    // The required form fields must be checked from the authenticated form schema.
    const now = new Date().toISOString();
    const data = {
      ...order.data, onboardingStatus: 'complete', onboardingSubmissionId: id,
      onboardingCompletedAt: now, deliveryWindowStart: businessDeadline(now, 5),
      deliveryWindowEnd: businessDeadline(now, 7), updatedAt: now,
    };
    await store.commit([
      { collection: 'travel_orders', id: order.id, data, version: order.version },
      { collection: 'travel_submissions', id, data: { checkoutSessionId: order.id, verifiedAt: now } },
      { collection: 'travel_notifications', id: 'onboarding_' + id, data: {
        kind: 'onboarding_received', customerEmail: data.customerEmail,
        checkoutSessionId: order.id, status: 'pending', createdAt: now,
      } },
    ]);
    return 'accepted';
  });
}

export function requiredAnswersComplete(submission, questions) {
  const required = Object.entries(questions).filter(([, question]) =>
    question.required === 'Yes' && question.type !== 'control_button');
  if (!required.length) return false;
  return required.every(([id]) => {
    const value = submission.answers?.[id]?.answer;
    if (value && typeof value === 'object') return Object.values(value).some(part => String(part || '').trim());
    return value !== undefined && value !== null && String(value).trim() !== '';
  });
}
