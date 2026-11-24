import { stripeGet } from './travel.js';

export function chargeIsSafe(charge) {
  return charge?.livemode === false && charge.paid === true && charge.status === 'succeeded' &&
    charge.captured === true && charge.amount_refunded === 0 && charge.disputed === false &&
    !charge.review && !Object.values(charge.fraud_details || {}).includes('fraudulent') &&
    !['highest', 'elevated'].includes(charge.outcome?.risk_level);
}

export async function verifyOriginalPayment(order, getStripe = stripeGet) {
  const session = await getStripe('checkout/sessions/' + encodeURIComponent(order.checkoutSessionId));
  if (session.customer !== order.customerId || session.subscription !== order.subscriptionId ||
      session.payment_status !== 'paid' || !session.invoice) throw new Error('Checkout binding unavailable');
  const invoice = await getStripe('invoices/' + encodeURIComponent(session.invoice));
  if (invoice.customer !== order.customerId || invoice.status !== 'paid' ||
      invoice.amount_paid !== 12600 || invoice.currency !== 'usd') throw new Error('Invoice not paid');
  let intents = [];
  if (invoice.payment_intent) intents = [invoice.payment_intent];
  else {
    const payments = await getStripe('invoice_payments?invoice=' + encodeURIComponent(invoice.id) + '&status=paid&limit=100');
    if (payments.has_more || !payments.data?.length) throw new Error('Invoice reconciliation required');
    intents = payments.data.map(payment => payment.payment?.payment_intent);
  }
  for (const id of intents) {
    if (typeof id !== 'string') throw new Error('Unsupported payment type');
    const intent = await getStripe('payment_intents/' + encodeURIComponent(id) + '?expand[]=latest_charge');
    const charge = typeof intent.latest_charge === 'string'
      ? await getStripe('charges/' + encodeURIComponent(intent.latest_charge)) : intent.latest_charge;
    if (!chargeIsSafe(charge) || charge.customer !== order.customerId) throw new Error('Payment requires risk review');
  }
}
