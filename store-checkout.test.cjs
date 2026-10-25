const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {attribution, checkoutURL, healthy} = require('./store-checkout.js');
test('campaign survives internal navigation but invalid labels never enter Stripe URL', () => {
  const a = attribution('?utm_source=youtube&utm_campaign=paperwork_oct20&email=private@example.com');
  assert.deepEqual(attribution('', a), a);
  const u = new URL(checkoutURL('https://buy.stripe.com/example', a, 'paperwork'));
  assert.equal(u.searchParams.get('utm_source'), 'youtube');
  assert.equal(u.searchParams.get('client_reference_id'), 'wi_youtube_site_paperwork_oct20_paperwork');
  assert.equal(u.searchParams.has('email'), false);
  const investigator = new URL(checkoutURL('https://buy.stripe.com/example', a, 'the-investigator'));
  assert.match(investigator.searchParams.get('client_reference_id'), /_investigator$/);
  const easyButton = new URL(checkoutURL('https://buy.stripe.com/example', a, 'easy-button-maker'));
  assert.match(easyButton.searchParams.get('client_reference_id'), /_easy-button$/);
  assert.deepEqual(attribution('?utm_source=%3Cscript%3E', {}), {});
  assert.throws(() => checkoutURL('https://buy.stripe.com.evil.invalid/x', a, 'paperwork'));
});
test('health gate requires all delivery checks, expected origin and HTTP success', async () => {
  const health = {ok:true,product_count:21,checks:{database:true,signing_secret:true,stripe_webhook_secret:true,service_origin:true,artifacts:true}};
  const responses = data => async url => ({ok:true,json:async()=>url==='fulfillment-config.json'?{enabled:true,api_base:'https://willis-fulfillment.onrender.com'}:data});
  assert.equal(await healthy(responses(health)), true);
  for(const key of Object.keys(health.checks)) {
    const bad=structuredClone(health);bad.checks[key]=false;
    assert.equal(await healthy(responses(bad)), false);
  }
  assert.equal(await healthy(async()=>({ok:false})), false);
  assert.equal(await healthy(async()=>({ok:true,json:async()=>({enabled:true,api_base:'https://wrong.invalid'})})), false);
});
test('published store exposes 21 unique, initially disabled Stripe checkouts', () => {
  const html = fs.readFileSync('willis-store.html', 'utf8');
  const buttons = [...html.matchAll(/<button class="button primary" disabled data-checkout="([^"]+)" data-product="([^"]+)"/g)];
  assert.equal(buttons.length, 21);
  assert.equal(new Set(buttons.map(match => match[1])).size, 21);
  assert.equal(new Set(buttons.map(match => match[2])).size, 21);
  for (const [, url] of buttons) assert.match(url, /^https:\/\/buy\.stripe\.com\//);
  assert.match(html, /href="privacy\.html"/);
  assert.match(html, /href="terms\.html"/);
  assert.match(html, /mailto:support@scios\.site/);
});
test('success page covers every product and does not treat return as payment proof', () => {
  const html = fs.readFileSync('willis-success.html', 'utf8');
  const store = fs.readFileSync('willis-store.html', 'utf8');
  const slugs = [...store.matchAll(/data-product="([^"]+)"/g)].map(match => match[1]);
  for (const slug of slugs) assert.ok(html.includes(slug), `missing success-page product name: ${slug}`);
  assert.match(html, /return page itself is not proof of settlement/i);
  assert.match(html, /\/api\/fulfillment\/session\//);
  assert.match(html, /\^https:\\\/\\\//);
});
