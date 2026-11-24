import { jotformGet } from '../server/jotform.js';
import { Firestore } from '../server/firestore.js';
import { rawBody, sameSecret, FORM_ID, sandboxOnly } from '../server/travel.js';
import { acceptSubmission, requiredAnswersComplete } from '../server/travel-onboarding.js';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
  // Configure the webhook using a trusted relay that sets this header.
  // A direct unsigned Jotform webhook is deliberately not sufficient.
  if (!sameSecret(req.headers.authorization, 'Bearer ' + (process.env.TRAVEL_ONBOARDING_WEBHOOK_SECRET || '')) ||
      !process.env.TRAVEL_ONBOARDING_WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    sandboxOnly();
    const body = JSON.parse(await rawBody(req, 4096));
    const id = String(body.submissionId || '');
    if (!/^\d{10,40}$/.test(id)) return res.status(400).json({ error: 'Invalid submission ID' });
    const [submission, questions] = await Promise.all([
      jotformGet('submission/' + id), jotformGet('form/' + FORM_ID + '/questions'),
    ]);
    if (!requiredAnswersComplete(submission, questions)) {
      return res.status(422).json({ error: 'Required onboarding answers are incomplete' });
    }
    const result = await acceptSubmission(submission, new Firestore());
    return res.status(200).json({ result });
  } catch {
    return res.status(503).json({ error: 'Onboarding not accepted; retry or request owner review' });
  }
}
