import { Firestore } from '../server/firestore.js';
import { FORM_ID, sameSecret, sandboxOnly } from '../server/travel.js';
import { jotformGet, formQuestions } from '../server/jotform.js';
import { acceptSubmission, requiredAnswersComplete } from '../server/travel-onboarding.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
  const secret = process.env.TRAVEL_OPERATIONS_SECRET;
  if (!secret || !sameSecret(req.headers.authorization, 'Bearer ' + secret)) return res.status(401).json({ error: 'Unauthorized' });
  try {
    sandboxOnly();
    const [submissions, questions] = await Promise.all([
      jotformGet('form/' + FORM_ID + '/submissions?limit=100&orderby=created_at&direction=DESC'),
      formQuestions(),
    ]);
    const store = new Firestore();
    let accepted = 0, duplicate = 0, review = 0;
    for (const submission of submissions) {
      if (!requiredAnswersComplete(submission, questions)) { review++; continue; }
      try {
        const result = await acceptSubmission(submission, store);
        if (result === 'accepted') accepted++;
        else duplicate++;
      } catch { review++; }
    }
    // No PII or references in the response. A full page requires paginated backfill.
    return res.status(200).json({ accepted, duplicate, review, backfillRequired: submissions.length === 100 });
  } catch { return res.status(503).json({ error: 'Onboarding synchronization unavailable' }); }
}
