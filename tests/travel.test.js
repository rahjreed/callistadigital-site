import { chargeIsSafe } from '../server/travel-payment.js';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHmac } from 'node:crypto';
import { PAYMENT_LINK, FORM_ID, verifySignature, hash, eligible, businessDeadline } from '../server/travel.js';
import { sessionOrder, processEvent, eventPatch } from '../server/travel-events.js';
import { acceptSubmission, requiredAnswersComplete } from '../server/travel-onboarding.js';
import portal from '../api/travel-billing.js';
import webhook from '../api/stripe-webhook.js';
import { Readable } from 'node:stream';

const reference = 'trv_' + 'a'.repeat(64);
const session = {
  id: 'cs_test_' + 'b'.repeat(30), livemode: false, payment_link: PAYMENT_LINK,
  payment_status: 'paid', status: 'complete', mode: 'subscription',
  amount_total: 12600, currency: 'usd', customer: 'cus_test', subscription: 'sub_test',
  invoice: 'in_original', client_reference_id: reference, created: 1795484276,
  customer_details: { email: 'buyer@example.test' },
};
const subscription = { id: 'sub_test', customer: 'cus_test', status: 'active',
  items: { data: [{ quantity: 1, price: { unit_amount: 2700, currency: 'usd',
    recurring: { interval: 'month', interval_count: 1 } } }] } };
const event = { id: 'evt_checkout1', livemode: false, created: 1795484276,
  type: 'checkout.session.completed', data: { object: session } };
const submission = { id: '123456789012345', form_id: FORM_ID, status: 'ACTIVE',
  answers: { 1: { name: 'orderReference', answer: reference }, 2: { answer: 'Travel business' } } };

class MemoryStore {
  records = new Map();
  writes = 0;
  async get(collection, id) { return this.records.get(collection + '/' + id) || null; }
  async find(collection, field, value) {
    return [...this.records.entries()].filter(([key, record]) =>
      key.startsWith(collection + '/') && record.data[field] === value).map(([, record]) => record);
  }
  async commit(updates) {
    for (const item of updates) {
      const existing = this.records.get(item.collection + '/' + item.id);
      if ((item.version && existing?.version !== item.version) || (!item.version && existing)) {
        const error = new Error('Conflict'); error.conflict = true; throw error;
      }
    }
    for (const item of updates) {
      this.records.set(item.collection + '/' + item.id,
        { id: item.id, data: structuredClone(item.data), version: String(++this.writes) });
    }
  }
}
async function seeded() {
  const store = new MemoryStore();
  await store.commit([{ collection: 'travel_references', id: hash(reference), data: { checkoutSessionId: '' } }]);
  return store;
}
const safeCharge = {id:'ch_test', livemode:false, paid:true, status:'succeeded', captured:true,
  amount_refunded:0, disputed:false, customer:'cus_test'};
const getStripe = async path => {
  if (path.startsWith('checkout/')) return structuredClone(session);
  if (path.startsWith('invoices/')) return {id:'in_original', customer:'cus_test', status:'paid',
    amount_paid:12600, currency:'usd', payment_intent:'pi_original'};
  if (path.startsWith('payment_intents/')) return {latest_charge:structuredClone(safeCharge)};
  return structuredClone(subscription);
};

test('signature rejects missing, malformed, forged, old and future timestamps', () => {
  const timestamp = Math.floor(Date.now() / 1000);
  const payload = JSON.stringify(event), secret = 'test_webhook_secret';
  const sign = value => createHmac('sha256', secret).update(value + '.' + payload).digest('hex');
  assert.equal(verifySignature(payload, `t=${timestamp},v1=${sign(timestamp)}`, secret), true);
  for (const header of ['', 't=abc,v1=nope', `t=${timestamp},v1=${'0'.repeat(64)}`,
    `t=${timestamp - 600},v1=${sign(timestamp - 600)}`, `t=${timestamp + 600},v1=${sign(timestamp + 600)}`]) {
    assert.equal(verifySignature(payload, header, secret), false);
  }
});

test('checkout verification rejects wrong price, currency, mode, account binding and reference', () => {
  for (const patch of [{livemode: true}, {amount_total: 9900}, {currency: 'eur'},
    {payment_status: 'unpaid'}, {payment_link: 'other'}, {mode: 'payment'}]) {
    assert.throws(() => sessionOrder({...session, ...patch}, reference, subscription, event.created));
  }
  assert.throws(() => sessionOrder(session, 'email@example.test', subscription, event.created));
  assert.throws(() => sessionOrder(session, reference, {...subscription, customer: 'cus_wrong'}, event.created));
  assert.throws(() => sessionOrder(session, reference, {...subscription, status: 'past_due'}, event.created));
  assert.equal(sessionOrder(session, reference, subscription, event.created).setupAmount, 9900);
});

test('concurrent duplicate webhooks atomically create one order and one outbox message', async () => {
  const store = await seeded();
  const results = await Promise.all([processEvent(event, store, getStripe), processEvent(event, store, getStripe)]);
  assert.deepEqual(results.sort(), ['duplicate', 'recorded']);
  assert.equal((await store.find('travel_orders', 'customerId', 'cus_test')).length, 1);
  assert.equal((await store.find('travel_notifications', 'status', 'pending')).length, 1);
});

test('Firestore conflicts unrelated to an existing event are retried, not swallowed', async () => {
  const store = await seeded(), commit = store.commit.bind(store);
  let failed = false;
  store.commit = async updates => {
    if (!failed) { failed = true; const error = new Error('Conflict'); error.conflict = true; throw error; }
    return commit(updates);
  };
  assert.equal(await processEvent(event, store, getStripe), 'recorded');
  assert.ok(await store.get('travel_orders', session.id));
});

test('forged, unpaid, wrong-form and duplicate onboarding cannot schedule fulfillment twice', async () => {
  const store = await seeded();
  await assert.rejects(acceptSubmission(submission, store, getStripe));
  await processEvent(event, store, getStripe);
  await assert.rejects(acceptSubmission({...submission, form_id: 'other'}, store, getStripe));
  const forged = structuredClone(submission); forged.answers[1].answer = 'trv_' + 'c'.repeat(64);
  await assert.rejects(acceptSubmission(forged, store, getStripe));
  const results = await Promise.all([acceptSubmission(submission, store, getStripe), acceptSubmission(submission, store, getStripe)]);
  assert.deepEqual(results.sort(), ['accepted', 'duplicate']);
  const order = (await store.get('travel_orders', session.id)).data;
  assert.equal(order.onboardingStatus, 'complete');
  assert.equal(order.fulfillmentStatus, 'not_started');
  await assert.rejects(acceptSubmission({...submission, id: '987654321098765'}, store, getStripe));
});

test('failed billing and refunded orders cannot accept onboarding', async () => {
  for (const patch of [{paymentStatus:'refund_review'}, {riskStatus:'hold'}]) {
    const store = await seeded();
    await processEvent(event, store, getStripe);
    const order = await store.get('travel_orders', session.id);
    await store.commit([{collection:'travel_orders', id:session.id, version:order.version, data:{...order.data,...patch}}]);
    await assert.rejects(acceptSubmission(submission, store, getStripe));
  }
  const store = await seeded(); await processEvent(event, store, getStripe);
  await assert.rejects(acceptSubmission(submission, store, async () => ({...subscription,status:'past_due'})));
});

test('renewals and stale invoice events use current subscription status; refunds and disputes hold work', () => {
  assert.equal(eventPatch({type:'invoice.payment_failed',data:{object:{id:'in_old'}}},{},{status:'active'}).billingStatus, 'active');
  assert.equal(eventPatch({type:'charge.refunded'},{paymentStatus:'paid'},{amount_refunded:9900}).riskStatus, 'hold');
  assert.equal(eventPatch({type:'charge.dispute.closed'},{},{}).riskStatus, 'hold');
  assert.equal(eligible({paymentStatus:'paid',riskStatus:'clear',billingStatus:'active',onboardingStatus:'complete',fulfillmentStatus:'not_started'}),true);
  assert.equal(eligible({paymentStatus:'paid',riskStatus:'hold'}), false);
});

test('delivery uses business days and schema-required answers must exist', () => {
  assert.equal(businessDeadline('2026-11-20T12:00:00Z',5),'2026-11-27T12:00:00.000Z');
  assert.equal(requiredAnswersComplete(submission, {2:{required:'Yes',type:'control_textbox'}}),true);
  assert.equal(requiredAnswersComplete(submission, {3:{required:'Yes',type:'control_textbox'}}),false);
  assert.equal(requiredAnswersComplete(submission, {}),false);
});

function response() {
  return {headers:{},setHeader(key,value){this.headers[key]=value;},status(code){this.code=code;return this;},
    json(body){this.body=body;return this;},end(){return this;}};
}
test('portal refuses caller-controlled URLs and live portal configuration', () => {
  const before = process.env.STRIPE_CUSTOMER_PORTAL_URL;
  try {
    for (const url of ['https://evil.test/p/login/test_x','https://billing.stripe.com/p/login/live_x']) {
      process.env.STRIPE_CUSTOMER_PORTAL_URL=url;
      const res=response(); portal({method:'GET'},res); assert.equal(res.code,503);
    }
    process.env.STRIPE_CUSTOMER_PORTAL_URL='https://billing.stripe.com/p/login/test_example';
    const res=response(); portal({method:'GET',query:{customer:'cus_attacker',return_url:'https://evil.test'}},res);
    assert.equal(res.code,303); assert.equal(res.headers.Location,process.env.STRIPE_CUSTOMER_PORTAL_URL);
  } finally {
    if (before === undefined) delete process.env.STRIPE_CUSTOMER_PORTAL_URL;
    else process.env.STRIPE_CUSTOMER_PORTAL_URL=before;
  }
});

test('webhook refuses invalid signatures before accessing Stripe or Firestore', async () => {
  const previous=process.env.STRIPE_WEBHOOK_SECRET;
  process.env.STRIPE_WEBHOOK_SECRET='test_secret';
  try {
    const req=Readable.from([JSON.stringify(event)]); req.method='POST'; req.headers={'stripe-signature':'forged'};
    const res=response(); await webhook(req,res); assert.equal(res.code,400);
  } finally {
    if (previous === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
    else process.env.STRIPE_WEBHOOK_SECRET=previous;
  }
});

test('authoritative charge checks block refunded, disputed, fraudulent and elevated-risk payments', () => {
  assert.equal(chargeIsSafe(safeCharge), true);
  for (const change of [{amount_refunded:9900},{disputed:true},{captured:false},{livemode:true},
    {fraud_details:{stripe_report:'fraudulent'}},{outcome:{risk_level:'elevated'}},{review:'prv_test'}]) {
    assert.equal(chargeIsSafe({...safeCharge,...change}), false);
  }
});import checkout from '../api/travel-checkout.js';
import operations from '../api/travel-operations.js';
import orderStatus from '../api/travel-order.js';
import onboardingWebhook from '../api/travel-onboarding-webhook.js';
import notifier from '../api/travel-notifications.js';
import sync from '../api/travel-sync.js';
import { confirmation } from '../server/travel-notifications.js';

test('privileged operations, polling, notifications and onboarding callbacks reject unauthenticated callers', async () => {
  for (const handler of [operations, sync, notifier, onboardingWebhook]) {
    const res = response();
    await handler({method:'POST',headers:{}}, res);
    assert.equal(res.code,401);
  }
});

test('unconfigured checkout and forged order lookups fail before making external requests', async () => {
  const secret = process.env.STRIPE_SECRET_KEY;
  delete process.env.STRIPE_SECRET_KEY;
  try {
    const res = response(); await checkout({method:'POST',headers:{origin:'https://evil.test'}},res);
    assert.equal(res.code,503);
    const req=Readable.from([JSON.stringify({orderReference:'guess'})]); req.method='POST';
    const result=response(); await orderStatus(req,result); assert.equal(result.code,404);
  } finally { if (secret !== undefined) process.env.STRIPE_SECRET_KEY=secret; }
});

test('customer notification preserves payment, refund and cancellation terms', () => {
  const order=sessionOrder(session,reference,subscription,event.created);
  const result=confirmation({kind:'payment_received'},order,'https://preview.example.test');
  for (const term of ['$99','$27/month','$126','72 hours','even if work has started',
    'except as required by law','end of your current billing period','5–7 business days']) {
    assert.ok(result.text.includes(term),term);
  }
  assert.ok(result.text.includes('/api/travel-onboarding?session_id='));
  assert.throws(()=>confirmation({kind:'injected'},order,'https://preview.example.test'));
});

test('72-hour setup refund window starts at payment event, not checkout creation', () => {
  const paidAt=event.created + 3600;
  const order=sessionOrder(session,reference,subscription,paidAt);
  assert.equal(order.setupRefundRequestDeadline,new Date((paidAt+72*3600)*1000).toISOString());
});

test('modern invoice-payment refund events map to subscription and place a hold', async () => {
  const store=await seeded(); await processEvent(event,store,getStripe);
  const refund={id:'evt_refund1',created:event.created+60,livemode:false,type:'charge.refunded',
    data:{object:{id:'ch_test'}}};
  const get=async path=>{
    if(path.startsWith('charges/')) return {...safeCharge,amount_refunded:9900,payment_intent:'pi_original'};
    if(path.startsWith('payment_intents/')) return {id:'pi_original'};
    if(path.startsWith('invoice_payments?payment')) return {data:[{invoice:'in_original'}],has_more:false};
    if(path.startsWith('invoices/')) return {parent:{subscription_details:{subscription:'sub_test'}}};
    return getStripe(path);
  };
  await processEvent(refund,store,get);
  const order=(await store.get('travel_orders',session.id)).data;
  assert.equal(order.paymentStatus,'refund_review'); assert.equal(order.riskStatus,'hold');
  await assert.rejects(acceptSubmission(submission,store,getStripe));
});

test('a subscription event arriving before checkout retries without recording a misleading receipt', async () => {
  const store=await seeded();
  const update={id:'evt_early',created:event.created,livemode:false,type:'customer.subscription.updated',
    data:{object:subscription}};
  await assert.rejects(processEvent(update,store,getStripe));
  assert.equal(await store.get('stripe_events','evt_early'),null);
});
