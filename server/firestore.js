import { createSign } from 'node:crypto';

export const PROJECT = 'callista-digital';
const BASE = `projects/${PROJECT}/databases/(default)/documents`;
const API = 'https://firestore.googleapis.com/v1/';
let cachedToken;

export async function firestoreToken() {
  if (cachedToken?.expires > Date.now()) return cachedToken.value;
  const credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '{}');
  if (credentials.project_id !== PROJECT || !credentials.client_email || !credentials.private_key) {
    throw new Error('Firebase service account unavailable or wrong project');
  }
  const now = Math.floor(Date.now() / 1000);
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const unsigned = encode({ alg: 'RS256', typ: 'JWT' }) + '.' + encode({
    iss: credentials.client_email, scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600,
  });
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  const assertion = unsigned + '.' + signer.sign(credentials.private_key).toString('base64url');
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', signal: AbortSignal.timeout(10000),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
  });
  if (!response.ok) throw new Error('Firebase authentication failed');
  const body = await response.json();
  cachedToken = { value: body.access_token, expires: Date.now() + 3000000 };
  return cachedToken.value;
}

function encodeValue(value) {
  if (value == null) return { nullValue: null };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return { integerValue: String(value) };
  return { stringValue: String(value) };
}

function decode(document) {
  if (!document?.fields) return null;
  return {
    data: Object.fromEntries(Object.entries(document.fields).map(([key, value]) => [
      key, value.stringValue ?? value.booleanValue ?? (value.integerValue === undefined ? null : Number(value.integerValue)),
    ])),
    version: document.updateTime,
    id: document.name.split('/').at(-1),
  };
}

export class Firestore {
  async request(path, method = 'GET', body) {
    const response = await fetch(API + path, {
      method, signal: AbortSignal.timeout(15000),
      headers: { Authorization: `Bearer ${await firestoreToken()}`, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (response.status === 404 && method === 'GET') return null;
    if (!response.ok) {
      const error = new Error('Firestore operation failed');
      error.conflict = response.status === 409 || response.status === 412;
      throw error;
    }
    return response.json();
  }

  async get(collection, id) {
    if (!/^[a-zA-Z0-9_-]{1,200}$/.test(id)) throw new Error('Invalid record ID');
    return decode(await this.request(`${BASE}/${collection}/${id}`));
  }

  async find(collection, field, value) {
    const results = await this.request(BASE + ':runQuery', 'POST', {
      structuredQuery: {
        from: [{ collectionId: collection }],
        where: { fieldFilter: { field: { fieldPath: field }, op: 'EQUAL', value: encodeValue(value) } },
        limit: 100,
      },
    });
    return results.filter(row => row.document).map(row => decode(row.document));
  }

  // CAS preconditions protect against concurrent onboarding, billing and event retries.
  async commit(updates) {
    const writes = updates.map(({ collection, id, data, version }) => ({
      update: {
        name: `${BASE}/${collection}/${id}`,
        fields: Object.fromEntries(Object.entries(data).map(([key, value]) => [key, encodeValue(value)])),
      },
      currentDocument: version ? { updateTime: version } : { exists: false },
    }));
    await this.request(BASE + ':commit', 'POST', { writes });
  }
}

export async function retryConflict(operation) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try { return await operation(); }
    catch (error) { if (!error.conflict || attempt === 4) throw error; }
  }
}
