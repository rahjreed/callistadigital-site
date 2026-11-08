import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { preview } from 'vite';

let server;
let origin;

before(async () => {
  server = await preview({ preview: { host: '127.0.0.1', port: 0 } });
  origin = `http://127.0.0.1:${server.httpServer.address().port}`;
});

after(async () => {
  await server?.close();
});

test('home and Creator Tools serve separate documents with canonical metadata', async () => {
  for (const [path, page] of [['/', 'home'], ['/tools', 'tools']]) {
    const response = await fetch(origin + path);
    assert.equal(response.status, 200);
    const document = await response.text();
    assert.ok(document.includes(`data-page="${page}"`));
    assert.ok(document.includes(`rel="canonical" href="https://www.callistadigital.com${path}"`));
    const bundle = document.match(/<script type="module"[^>]*src="([^"]+)"/)?.[1];
    assert.ok(bundle);
    const script = await fetch(origin + bundle);
    assert.equal(script.status, 200);
    assert.match(script.headers.get('content-type'), /javascript/);
  }
});

test('unknown routes remain 404s and local artwork is served as images', async () => {
  const missing = await fetch(origin + '/missing-page');
  assert.equal(missing.status, 404);
  for (const path of ['/favicon.png', '/work/callista-wordmark.png', '/work/prompterson.svg', '/work/kingdom-race.webp']) {
    const asset = await fetch(origin + path);
    assert.equal(asset.status, 200);
    assert.match(asset.headers.get('content-type'), /^image\//);
  }
});
