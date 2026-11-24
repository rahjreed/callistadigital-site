import { Firestore, retryConflict } from './firestore.js';
import { PAYMENT_LINK, hash, validOrderReference, subscriptionId, stripeGet } from './travel.js';

export function sessionOrder(session, reference, subscription, paidAt) {
  if (!Number.isInteger(paidAt) || session.livemode !== false || !/^cs_test_[A-Za-z0-9]+$/.test(session.id || '') ||
      session.payment_link !== PAYMENT_LINK || session.payment_status !== 'paid' ||
      session.status !== 'complete' || session.mode !== 'subscription' ||
      session.amount_total !== 12600 || session.currency !== 'usd' ||
      !session.customer || !session.subscription || !validOrderReference(reference)) {
    throw new Error('Checkout not eligible');
  }
  if (subscription.customer !== session.customer || subscription.id !== session.subscription ||
      subscription.status !== 'active') throw new Error('Subscription not eligible');
  const items = subscription.items?.data || [];
  if (items.length !== 1 || items[0].quantity !== 1 ||
      items[0].price?.unit_amount !== 2700 || items[0].price?.currency !== 'usd' ||
      items[0].price?.recurring?.interval !== 'month' ||
      items[0].price?.recurring?.interval_count !== 1) throw new Error('Unexpected subscription price');
  return {
    checkoutSessionId: session.id, orderReferenceHash: hash(reference),
    customerId: session.customer, subscriptionId: session.subscription,
    paymentStatus: 'paid', onboardingStatus: 'awaiting_submission',
    billingStatus: 'active', riskStatus: 'clear', fulfillmentStatus: 'not_started',
    setupAmount: 9900, firstMonthAmount: 2700, currency: 'usd',
    customerEmail: session.customer_details?.email || session.customer_email || '',
    paidAt: paidAt * 1000, createdAt: new Date().toISOString(),
    setupRefundRequestDeadline: new Date(paidAt * 1000 + 72 * 3600000).toISOString(),
    referenceVersion: 1,
  };
}

export function eventPatch(event, current, authoritative) {
  if (event.type.startsWith('customer.subscription.')) {
    const subscription = authoritative;
    return {
      billingStatus: subscription.status,
      cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
      paidThrough: subscription.items?.data?.[0]?.current_period_end || subscription.current_period_end || 0,
    };
  }
  if (event.type.startsWith('invoice.')) {
    // Current subscription state is authoritative even when invoice events arrive out of order.
    return {
      billingStatus: authoritative.status,
      lastInvoiceId: event.data.object.id,
      lastInvoiceEvent: event.type,
    };
  }
  if (event.type === 'charge.refunded') {
    return { paymentStatus: authoritative.amount_refunded > 0 ? 'refund_review' : current.paymentStatus,
      riskStatus: authoritative.amount_refunded > 0 ? 'hold' : current.riskStatus };
  }
  if (event.type.startsWith('charge.dispute.') || event.type === 'radar.early_fraud_warning.created') {
    return { riskStatus: 'hold' };
  }
  return {};
}

export async function processEvent(event, store = new Firestore(), getStripe = stripeGet) {
  if (event.livemode !== false || !/^evt_[A-Za-z0-9]+$/.test(event.id || '') ||
      !Number.isInteger(event.created) || !event.data?.object?.id) throw new Error('Invalid sandbox event');
  const object = event.data.object;
  const checkout = ['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event.type);
  return retryConflict(async () => {
    if (await store.get('stripe_events', event.id)) return 'duplicate';
    const updates = [];
    let noticeOrder;
    if (checkout && object.payment_link === PAYMENT_LINK && object.payment_status === 'paid') {
      const session = await getStripe('checkout/sessions/' + encodeURIComponent(object.id));
      const existing = await store.get('travel_orders', session.id);
      const reference = session.client_reference_id;
      // Legacy payments stay recorded but require an owner-assisted migration.
      if (!validOrderReference(reference)) {
        if (!existing) throw new Error('Paid checkout requires order reference migration');
      } else {
        const pending = await store.get('travel_references', hash(reference));
        if (!pending || pending.data.checkoutSessionId && pending.data.checkoutSessionId !== session.id) {
          throw new Error('Order reference is unavailable or already used');
        }
        const subscription = await getStripe('subscriptions/' + encodeURIComponent(session.subscription));
        const verified = sessionOrder(session, reference, subscription, event.created);
        if (!existing) {
          updates.push({ collection: 'travel_orders', id: session.id, data: verified });
          noticeOrder = verified;
        }
        updates.push({ collection: 'travel_references', id: hash(reference),
          data: { ...pending.data, checkoutSessionId: session.id }, version: pending.version });
      }
    } else {
      let subId = subscriptionId(object);
      let authoritative = object;
      if (event.type.startsWith('customer.subscription.')) subId = object.id;
      const riskEvent = event.type.startsWith('charge.dispute.') ||
        event.type === 'radar.early_fraud_warning.created' || event.type === 'charge.refunded';
      if (riskEvent) {
        const chargeId = event.type === 'charge.refunded' ? object.id : object.charge;
        authoritative = await getStripe('charges/' + encodeURIComponent(chargeId));
        // A charge can refer to a subscription invoice or payment intent.
        let invoiceId = authoritative.invoice;
        if (!invoiceId && authoritative.payment_intent) {
          const intent = await getStripe('payment_intents/' + encodeURIComponent(authoritative.payment_intent));
          invoiceId = intent.invoice;
        }
        if (!invoiceId && authoritative.payment_intent) {
          const payments = await getStripe('invoice_payments?payment[type]=payment_intent&payment[payment_intent]=' +
            encodeURIComponent(authoritative.payment_intent) + '&limit=100');
          if (payments.has_more || payments.data?.length !== 1) throw new Error('Invoice payment reconciliation required');
          invoiceId = payments.data[0].invoice;
        }
        if (invoiceId) subId = subscriptionId(await getStripe('invoices/' + encodeURIComponent(invoiceId)));
        // Never acknowledge a risk event we cannot map: it needs reconciliation.
        if (!subId) throw new Error('Risk event requires invoice reconciliation');
      }
      if (subId) {
        const orders = await store.find('travel_orders', 'subscriptionId', subId);
        if (!orders.length) throw new Error('Order not yet available; retry event');
        if (!riskEvent) authoritative = await getStripe('subscriptions/' + encodeURIComponent(subId));
        for (const record of orders) {
          const updated = { ...record.data, ...eventPatch(event, record.data, authoritative),
            updatedAt: new Date().toISOString() };
          updates.push({ collection: 'travel_orders', id: record.id, data: updated, version: record.version });
          noticeOrder = updated;
        }
      }
    }
    updates.push({ collection: 'stripe_events', id: event.id, data: {
      type: event.type, livemode: false, stripeObjectId: object.id,
      created: event.created, receivedAt: new Date().toISOString(),
    } });
    if (noticeOrder) updates.push({ collection: 'travel_notifications', id: event.id, data: {
      kind: checkout ? 'payment_received' : 'billing_update',
      checkoutSessionId: noticeOrder.checkoutSessionId,
      customerEmail: noticeOrder.customerEmail, status: 'pending', createdAt: new Date().toISOString(),
    } });
    await store.commit(updates);
    return 'recorded';
  });
}
