/**
 * Local stand-in for Batch F's n8n webhook.
 *
 * It exists so lib/lead.ts has somewhere to POST in development and in the
 * verification run, without a real n8n and without a single live API call.
 *
 *   npm run mock          # serves on 8787, prints every payload
 *   npm run dev           # vite proxies /api -> 8787
 *
 * Two behaviours, which is what the recovery gate drives:
 *   POST /api/lead        -> 200
 *   POST /api/lead-fail   -> 500 always, to exercise retry and the queue
 *
 * WHAT THIS NO LONGER DOES, AND WHY.
 *
 * It used to validate the body strictly against the payload contract in
 * 00-START-HERE.md: eleven required keys, five enums, two optional "_other"
 * keys that could only ride beside an answer of "other", and a re-implementation
 * of the three-rule routing table so the mock and src/lib/contract.ts could be
 * diffed against each other by eye. All of that described the fit-check form,
 * which is gone, and none of it described lib/lead.ts, which is not: that file
 * serialises whatever object it is handed and adds `dedupe_id`.
 *
 * A validator for a shape nothing sends is worse than no validator. It would
 * have gone on passing on an empty run, and it would have rejected the first
 * payload the next form invents - a gate failing on correct code, which is how
 * a suite teaches people to stop reading it. The endpoint accepts any JSON
 * object now. When something is POSTed from the page again and its shape is
 * agreed, the validation belongs back here, written against that shape.
 *
 * `dedupe_id` is still read out and logged, because it is the one key this
 * repository puts on the wire itself and the live webhook deduplicates on it.
 */
import { createServer } from 'node:http';
import { appendFileSync, writeFileSync } from 'node:fs';

const PORT = Number(process.env.MOCK_PORT ?? 8787);
const LOG = process.env.MOCK_LOG ?? '';

/** The one thing still asserted about a body: that it is a JSON object. */
export function validate(body) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return ['payload is not a JSON object'];
  }
  return [];
}

const server = createServer((req, res) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-DoviLoop-Dedupe',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors);
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { ...cors, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'POST only' }));
    return;
  }

  let raw = '';
  req.on('data', (chunk) => {
    raw += chunk;
  });
  req.on('end', () => {
    if (req.url === '/api/lead-fail') {
      console.log('[mock] deliberate 500 on /api/lead-fail');
      res.writeHead(500, { ...cors, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'deliberate failure for retry testing' }));
      return;
    }

    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      res.writeHead(400, { ...cors, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'body is not valid JSON' }));
      return;
    }

    const problems = validate(body);
    const record = {
      received_at: new Date().toISOString(),
      dedupe: req.headers['x-doviloop-dedupe'] ?? null,
      /* The one the real webhook actually dedupes on. It reads the body, not
         the header, which is how a retry was able to make a second lead. */
      dedupe_in_body: body?.dedupe_id ?? null,
      valid: problems.length === 0,
      problems,
      body,
    };

    if (LOG) appendFileSync(LOG, JSON.stringify(record) + '\n');

    if (problems.length === 0) {
      console.log(`[mock] received  ${Object.keys(body).length} keys  dedupe ${record.dedupe_in_body ?? 'none'}`);
      res.writeHead(200, { ...cors, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    } else {
      console.error('[mock] rejected:');
      for (const p of problems) console.error('   -', p);
      res.writeHead(422, { ...cors, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, problems }));
    }
  });
});

if (LOG) writeFileSync(LOG, '');

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[mock] listening on http://127.0.0.1:${PORT}/api/lead`);
  console.log('[mock] POST /api/lead-fail always returns 500, for the retry path');
});
