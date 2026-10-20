const test = require('node:test');
const assert = require('node:assert/strict');
const {attribution, checkoutURL, healthy} = require('./store-checkout.js');
test('campaign survives internal navigation but invalid labels never enter Stripe URL', () => {
  const a = attribution('?utm_source=youtube&utm_campaign=paperwork_oct20&email=private@example.com');
  assert.deepEqual(attribution('', a), a);
  const u = new URL(checkoutURL('https://buy.stripe.com/example', a, 'paperwork'));
  assert.equal(u.searchParams.get('utm_source'), 'youtube');
  assert.equal(u.searchParams.get('client_reference_id'), 'wi_youtube_site_paperwork_oct20_paperwork');
  assert.equal(u.searchParams.has('email'), false);
  assert.deepEqual(attribution('?utm_source=%3Cscript%3E', {}), {});
  assert.throws(() => checkoutURL('https://buy.stripe.com.evil.invalid/x', a, 'paperwork'));
});
test('health gate requires all delivery checks, expected origin and HTTP success', async () => {
  const health = {ok:true,product_count:21,checks:{database:true,signing_secret:true,stripe_webhook_secret:true,artifacts:true}};
  const responses = data => async url => ({ok:true,json:async()=>url==='fulfillment-config.json'?{enabled:true,api_base:'https://willis-fulfillment.onrender.com'}:data});
  assert.equal(await healthy(responses(health)), true);
  for(const key of Object.keys(health.checks)) {
    const bad=structuredClone(health);bad.checks[key]=false;
    assert.equal(await healthy(responses(bad)), false);
  }
  assert.equal(await healthy(async()=>({ok:false})), false);
  assert.equal(await healthy(async()=>({ok:true,json:async()=>({enabled:true,api_base:'https://wrong.invalid'})})), false);
});
