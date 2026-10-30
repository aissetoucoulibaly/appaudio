import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createService } from './service.mjs';
const token = 'test-only-not-a-real-secret-123456789';
const env = { AI_PROVIDER: 'openai', SERVER_TOKEN: token, OPENAI_API_KEY: 'test-only', AI_MODEL: 'mock-model', AI_INPUT_EUR_PER_MILLION: '1', AI_OUTPUT_EUR_PER_MILLION: '1', MONTHLY_BUDGET_EUR: '5' };
const body = { hero: 'Hugo', brief: { universe: 'fire', mission: 'thief', setting: 'village', mood: 'sleep', companions: ['Zoé'], detail: 'Un voleur de biscuits' } };
const request = { method: 'POST', path: '/stories', authorization: `Bearer ${token}`, idempotencyKey: 'test-1', body };
function fake() {
  let count = 0;
  return { get count() { return count; }, fetcher: async () => {
    count++;
    const content = count % 2 ? { title: 'Le panier de biscuits', paragraphs: ['Un matin au village.', 'Les adultes résolvent le mystère.', 'Tous les amis rentrent au calme.'] } : { safe: true };
    return { ok: true, json: async () => ({ usage: { prompt_tokens: 100, completion_tokens: 50 }, choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(content) } }] }) };
  } };
}
test('creation is reviewed; replay returns the same story without paid calls', async () => {
  const f = fake(); const s = createService({ env, fetcher: f.fetcher });
  const first = await s.handle(request); const second = await s.handle(request);
  assert.equal(first.status, 200); assert.equal(second.body.story.id, first.body.story.id); assert.equal(f.count, 2);
  assert.equal((await s.handle({ ...request, body: { ...body, hero: 'Adam' } })).status, 409); s.close();
});
test('budget rejection and missing configuration never call provider', async () => {
  const f = fake(); const s = createService({ env: { ...env, MONTHLY_BUDGET_EUR: '.001' }, fetcher: f.fetcher });
  assert.equal((await s.handle(request)).status, 402); assert.equal(f.count, 0); s.close();
  const disabled = createService({ env: { SERVER_TOKEN: token }, fetcher: f.fetcher });
  assert.equal((await disabled.handle(request)).status, 503); assert.equal(f.count, 0); disabled.close();
});
test('unauthorized and sensitive requests are blocked before provider', async () => {
  const f = fake(); const s = createService({ env, fetcher: f.fetcher });
  assert.equal((await s.handle({ ...request, authorization: '' })).status, 401);
  assert.equal((await s.handle({ ...request, body: { ...body, brief: { ...body.brief, detail: 'adresse 12345' } } })).status, 400);
  assert.equal((await s.handle({ ...request, body: { ...body, brief: { ...body.brief, detail: 'Son école' } } })).status, 400);
  assert.equal(f.count, 0); s.close();
});
test('ambiguous failure is not retried and keeps its reservation', async () => {
  let calls = 0; const s = createService({ env, fetcher: async () => { calls++; throw Error('timeout'); } });
  assert.equal((await s.handle(request)).status, 502);
  assert.equal((await s.handle(request)).status, 409); assert.equal(calls, 1);
  const state = await s.handle({ method: 'GET', path: '/health', authorization: request.authorization });
  assert.ok(state.body.spentEuro > 0); s.close();
});
test('content refused by reviewer is never delivered', async () => {
  const s = createService({ env, fetcher: async () => ({ ok: true, json: async () => ({ usage: { prompt_tokens: 50, completion_tokens: 30 }, choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ title: 'Titre', paragraphs: ['Un.', 'Deux.', 'Trois.'], safe: false }) } }] }) }) });
  assert.equal((await s.handle(request)).status, 502); s.close();
});

test('a pending request reserves budget and blocks concurrent paid work', async () => {
  let release;
  const wait = new Promise(resolve => { release = resolve; });
  const f = fake();
  const s = createService({ env, fetcher: async (...args) => { await wait; return f.fetcher(...args); } });
  const pending = s.handle(request);
  assert.equal((await s.handle({ ...request, idempotencyKey: 'another-request' })).status, 409);
  const state = await s.handle({ method: 'GET', path: '/health', authorization: request.authorization });
  assert.ok(state.body.spentEuro > 0);
  release(); assert.equal((await pending).status, 200); assert.equal(f.count, 2); s.close();
});

test('Anthropic adapter uses tool results and keeps keys server-side', async () => {
  let calls = 0;
  const s = createService({ env: { ...env, AI_PROVIDER: 'anthropic', ANTHROPIC_API_KEY: 'test-anthropic-only' }, fetcher: async (url, options) => {
    assert.equal(url, 'https://api.anthropic.com/v1/messages');
    assert.equal(options.headers['x-api-key'], 'test-anthropic-only');
    const body = JSON.parse(options.body); calls++;
    const name = body.tool_choice.name;
    const input = name === 'story' ? { title: 'Une petite aventure', paragraphs: ['Un matin.', 'Des adultes aident.', 'La soirée est douce.'] } : { safe: true };
    return { ok: true, json: async () => ({ stop_reason: 'tool_use', usage: { input_tokens: 80, output_tokens: 30 }, content: [{ type: 'tool_use', name, input }] }) };
  } });
  assert.equal((await s.handle(request)).status, 200); assert.equal(calls, 2); s.close();
});
