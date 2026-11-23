import { createHmac, timingSafeEqual } from "node:crypto";

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
  // Safety gate: do not acknowledge events as processed until durable
  // idempotent storage, customer reconciliation and notifications are connected.
  // Stripe will retry this event; no fulfillment is initiated by this endpoint.
  console.info("Verified Stripe event awaiting durable processing", {
    eventId: event.id, eventType: event.type, livemode: event.livemode
  });
  return res.status(503).json({ error: "Event processing not yet configured" });
}
