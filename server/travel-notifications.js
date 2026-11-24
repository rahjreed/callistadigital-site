export function confirmation(job, order, site) {
  const subject = {
    payment_received: 'Your Callista Digital sandbox payment was received',
    onboarding_received: 'Your Callista Digital project brief was received',
    approved: 'Your Callista Digital project was approved',
    in_progress: 'Your Callista Digital project is in progress',
    delivered: 'Your Callista Digital project is ready',
    billing_update: 'Your Callista Digital billing status was updated',
  }[job.kind];
  if (!subject) throw new Error('Unknown notification kind');
  const body = [
    'Sandbox order update from Callista Digital.',
    'Payment status: ' + order.paymentStatus + '. Billing status: ' + order.billingStatus + '.',
    'Onboarding status: ' + order.onboardingStatus + '. Project status: ' + order.fulfillmentStatus + '.',
    'Pricing is $99 one-time setup and $27/month. Initial payment is $126.',
    'Delivery is within 5–7 business days after verified payment and completed onboarding.',
    'The $99 setup fee is fully refundable on request within 72 hours of payment, even if work has started.',
    'Monthly charges are nonrefundable once processed, except as required by law.',
    'You may cancel anytime, effective at the end of your current billing period.',
    'For help or a refund request, email hello@callistadigital.com.',
    'Billing management: ' + site + '/api/travel-billing',
  ];
  if (job.kind === 'payment_received') body.push(
    'Continue onboarding: ' + site + '/api/travel-onboarding?session_id=' + encodeURIComponent(order.checkoutSessionId),
  );
  if (order.deliveryWindowEnd) body.push('Delivery window: ' + order.deliveryWindowStart + ' through ' + order.deliveryWindowEnd);
  return { subject, text: body.join('\n') };
}
