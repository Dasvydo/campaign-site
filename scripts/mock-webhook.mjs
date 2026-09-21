/**
 * Local mock of Batch F's n8n webhook.
 *
 * Stands in for VITE_LEAD_WEBHOOK_URL so the qualifier payload can be verified
 * without a real n8n and without a single live API call. It validates the body
 * strictly against the contract in 00-START-HERE.md: unknown keys, missing
 * keys, wrong types and out-of-range enum values are all rejected.
 *
 *   npm run mock          # serves on 8787, prints every payload
 *   npm run dev           # vite proxies /api -> 8787
 *
 * Two behaviours exist for testing the recovery path:
 *   POST /api/lead        -> 200, validates
 *   POST /api/lead-fail   -> 500 always, to exercise retry and the queue
 */
import { createServer } from 'node:http';
import { appendFileSync, writeFileSync } from 'node:fs';

const PORT = Number(process.env.MOCK_PORT ?? 8787);
const LOG = process.env.MOCK_LOG ?? '';

const ENUMS = {
  source: ['reel', 'ad', 'outreach', 'direct'],
  market: ['dk', 'lt', 'global'],
  locale: ['en', 'da', 'lt'],
  team_size: ['1-9', '10-24', '25-49', '50+'],
  email_client: ['outlook', 'gmail', 'other'],
  role: ['owner_partner', 'ops_office_manager', 'it_admin', 'other'],
};

const TOP_LEVEL = [
  'source', 'market', 'locale', 'utm', 'company_name', 'work_email',
  'phone', 'team_size', 'email_client', 'role', 'submitted_at',
];
/* Keys that may be there and may not, which is different from keys that are
   missing. This list used to be empty and TOP_LEVEL did both jobs, so the
   first optional key added to the wire read as "unexpected key" here.

   `dedupe_id` is put on by lib/lead.ts at post time, not by the form.
   The two `_other` keys ride only when the reader picked "Something else" and
   typed. The live webhook was probed on 2026-09-21 and accepts all three. */
const OPTIONAL = ['dedupe_id', 'email_client_other', 'role_other'];
const UTM_KEYS = ['source', 'medium', 'campaign', 'content'];

export function validate(body) {
  const problems = [];

  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return ['payload is not a JSON object'];
  }

  for (const key of TOP_LEVEL) {
    if (!(key in body)) problems.push(`missing key: ${key}`);
  }
  for (const key of Object.keys(body)) {
    if (!TOP_LEVEL.includes(key) && !OPTIONAL.includes(key)) {
      problems.push(`unexpected key: ${key}`);
    }
  }
  for (const key of OPTIONAL) {
    if (key in body && typeof body[key] !== 'string') problems.push(`${key} is not a string`);
    if (key in body && body[key].trim() === '') problems.push(`${key} is present but empty`);
  }
  /* The rule the page implements, checked here rather than assumed: a word
     saying what the something else was has no meaning beside an answer that is
     not "other", and sending one would describe a lead wrongly. */
  for (const [key, owner] of [['email_client_other', 'email_client'], ['role_other', 'role']]) {
    if (key in body && body[owner] !== 'other') {
      problems.push(`${key} sent while ${owner} = ${JSON.stringify(body[owner])}`);
    }
  }

  for (const [key, allowed] of Object.entries(ENUMS)) {
    if (key in body && !allowed.includes(body[key])) {
      problems.push(`${key} = ${JSON.stringify(body[key])} is not one of ${allowed.join(' | ')}`);
    }
  }

  /* `phone` is still required to be present and still required to be a string:
     the contract carries the key and Batch F reads it. What changed on
     2026-09-19 is that it may now be empty, because the page stopped asking
     for it (T23) and the spec and the n8n validator were changed to match.
     It stays in this loop for its type and out of the emptiness check, so a
     missing or non-string phone is still caught. */
  for (const key of ['company_name', 'work_email', 'phone']) {
    if (key in body && typeof body[key] !== 'string') problems.push(`${key} is not a string`);
  }
  for (const key of ['company_name', 'work_email']) {
    if (key in body && body[key].trim() === '') problems.push(`${key} is empty`);
  }

  const utm = body.utm;
  if (utm === null || typeof utm !== 'object' || Array.isArray(utm)) {
    problems.push('utm is not an object');
  } else {
    for (const k of UTM_KEYS) {
      if (!(k in utm)) problems.push(`utm missing key: ${k}`);
      else if (typeof utm[k] !== 'string') problems.push(`utm.${k} is not a string`);
    }
    for (const k of Object.keys(utm)) {
      if (!UTM_KEYS.includes(k)) problems.push(`utm has unexpected key: ${k}`);
    }
  }

  if ('submitted_at' in body) {
    const t = Date.parse(body.submitted_at);
    if (Number.isNaN(t)) problems.push('submitted_at is not parseable as ISO-8601');
    else if (!/^\d{4}-\d{2}-\d{2}T[\d:.]+Z?/.test(String(body.submitted_at))) {
      problems.push('submitted_at is not in ISO-8601 form');
    }
  }

  return problems;
}

/** The routing table, re-implemented here from the spec on purpose. If this and
 *  src/lib/contract.ts ever disagree, one of them has drifted from the table. */
function expectedOutcome(body) {
  if (body.team_size === '1-9') return 'too_small';
  return body.email_client === 'outlook' ? 'qualified' : 'gmail_on_request';
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
      expected_outcome: problems.length === 0 ? expectedOutcome(body) : null,
      body,
    };

    if (LOG) appendFileSync(LOG, JSON.stringify(record) + '\n');

    if (problems.length === 0) {
      console.log(`[mock] VALID  ${body.locale}/${body.market}  ${body.team_size}  ${body.email_client}  -> ${record.expected_outcome}`);
      res.writeHead(200, { ...cors, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, outcome: record.expected_outcome }));
    } else {
      console.error('[mock] INVALID payload:');
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
