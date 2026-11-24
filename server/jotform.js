import { FORM_ID } from './travel.js';

export async function jotformGet(path) {
  const key = process.env.JOTFORM_API_KEY;
  if (!key) throw new Error('Jotform read key unavailable');
  const response = await fetch('https://api.jotform.com/' + path, {
    signal: AbortSignal.timeout(12000), headers: { APIKEY: key },
  });
  if (!response.ok) throw new Error('Jotform verification failed');
  const body = await response.json();
  if (body.responseCode !== 200) throw new Error('Jotform verification failed');
  return body.content;
}

export const formQuestions = () => jotformGet('form/' + FORM_ID + '/questions');
