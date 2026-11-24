import { createHmac, createSign, timingSafeEqual } from "node:crypto";

export const config = { api: { bodyParser: false } };
const MAX_BODY_BYTES = 1024 * 1024;
const TOLERANCE_SECONDS = 300;

async function readRawBody(req) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > MAX_BODY_BYTES) throw new Error("Payload too large");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function verifyStripeSignature(payload, header, secret) {
  if (!header || !secret) return false;
  const fields = header.split(",").map((s) => s.trim().split("="));
  const timestamp = fields.find(([k]) => k === "t")?.[1];
  const signatures = fields.filter(([k]) => k === "v1").map(([, v]) => v);
  if (!timestamp || !/^\d+$/.test(timestamp) || !signatures.length) return false;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(timestamp)) > TOLERANCE_SECONDS) return false;
  const expected = createHmac("sha256", secret).update(timestamp + "." + payload).digest();
  return signatures.some((value) => {
    if (!/^[a-f0-9]{64}$/i.test(value)) return false;
    const received = Buffer.from(value, "hex");
    return received.length === expected.length && timingSafeEqual(received, expected);
  });
}

const PROJECT_ID = "callista-digital";
const PAYMENT_LINK = "plink_1Uf52S8c4pFptBOLKi3CupK4";
const FIRESTORE_BASE = `projects/${PROJECT_ID}/databases/(default)/documents`;

function firebaseValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") return { integerValue: String(value) };
  return { stringValue: String(value) };
}
function fields(data) {
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, firebaseValue(value)]));
}
function encodeBase64Url(value) {
  return Buffer.from(typeof value === "string" ? value : JSON.stringify(value)).toString("base64url");
}
async function getFirestoreToken() {
  const encoded = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!encoded) throw new Error("Firebase credentials missing");
  const credentials = JSON.parse(encoded);
  if (credentials.project_id !== PROJECT_ID || !credentials.client_email || !credentials.private_key) {
    throw new Error("Firebase service account project mismatch");
  }
  const now = Math.floor(Date.now() / 1000);
  const jwtHeader = encodeBase64Url({ alg: "RS256", typ: "JWT" });
  const jwtClaims = encodeBase64Url({
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: "https://oauth2.googleapis.com/token",
    iat: now, exp: now + 3600
  });
  const unsigned = jwtHeader + "." + jwtClaims;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const assertion = unsigned + "." + signer.sign(credentials.private_key).toString("base64url");
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion })
  });
  if (!response.ok) throw new Error("Firebase authentication failed");
  const body = await response.json();
  return body.access_token;
}
async function recordEvent(event) {
  const token = await getFirestoreToken();
  const obj = event.data?.object || {};
  const id = event.id;
  if (!/^evt_[a-zA-Z0-9]+$/.test(id)) throw new Error("Invalid Stripe event ID");
  const eventDoc = `${FIRESTORE_BASE}/stripe_events/${id}`;
  const writes = [{
    update: { name: eventDoc, fields: fields({
      type: event.type, livemode: event.livemode, stripeObjectId: obj.id || "",
      created: event.created || 0, receivedAt: new Date().toISOString()
    }) },
    currentDocument: { exists: false }
  }];
  if (event.type === "checkout.session.completed" && obj.payment_link === PAYMENT_LINK &&
      obj.payment_status === "paid" && obj.amount_total === 12600 && obj.currency === "usd") {
    const orderId = obj.id;
    if (!/^cs_test_[a-zA-Z0-9]+$/.test(orderId)) throw new Error("Unexpected checkout session ID");
    writes.push({
      update: { name: `${FIRESTORE_BASE}/travel_orders/${orderId}`, fields: fields({
        checkoutSessionId: orderId, customerId: obj.customer || "",
        subscriptionId: obj.subscription || "", paymentStatus: "paid",
        onboardingStatus: "awaiting_submission", setupAmount: 9900,
        firstMonthAmount: 2700, currency: "usd",
        customerEmail: obj.customer_details?.email || obj.customer_email || "",
        createdAt: new Date().toISOString()
      }) },
      currentDocument: { exists: false }
    });
  }
  const response = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:commit`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ writes })
  });
  if (response.status === 409) return "duplicate";
  if (!response.ok) throw new Error(`Firestore commit failed (${response.status})`);
  return "recorded";
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return res.status(503).json({ error: "Webhook not configured" });
  let raw;
  try {
    raw = await readRawBody(req);
  } catch {
    return res.status(413).json({ error: "Invalid or oversized payload" });
  }
  if (!verifyStripeSignature(raw, req.headers["stripe-signature"], secret)) {
    return res.status(400).json({ error: "Invalid signature" });
  }
  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }
  if (event.livemode !== false) return res.status(400).json({ error: "Sandbox events only" });
  try {
    const outcome = await recordEvent(event);
    console.info("Stripe event recorded", { id: event.id, type: event.type, outcome });
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Stripe event processing failed", { id: event.id, message: error.message });
    return res.status(503).json({ error: "Processing unavailable; Stripe should retry" });
  }
}
