/* Campaign labels contain no visitor identifier. Payment verification stays server-side. */
(function (root) {
  'use strict';
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
  const clean = value => /^[A-Za-z0-9_-]{1,48}$/.test(value || '') ? value : '';
  function attribution(query, saved) {
    const params = new URLSearchParams(query);
    const current = Object.fromEntries(keys.map(key => [key, clean(params.get(key))]).filter(pair => pair[1]));
    return current.utm_source ? current : Object.fromEntries(keys.map(key => [key, clean((saved || {})[key])]).filter(pair => pair[1]));
  }
  function checkoutURL(value, campaign, product) {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.hostname !== 'buy.stripe.com' || url.username || url.password) throw Error('Invalid checkout destination');
    keys.forEach(key => { if (clean(campaign[key])) url.searchParams.set(key, campaign[key]); });
    const reference = ['wi', campaign.utm_source || 'direct', campaign.utm_medium || 'site', campaign.utm_campaign || 'organic', clean(product) || 'catalog'].join('_');
    url.searchParams.set('client_reference_id', reference.slice(0, 200));
    return url.href;
  }
  async function healthy(fetcher, signal) {
    const response = await fetcher('fulfillment-config.json', {cache:'no-store', signal});
    if (!response.ok) return false;
    const config = await response.json();
    if (config.enabled !== true || config.api_base !== 'https://willis-fulfillment.onrender.com') return false;
    const healthResponse = await fetcher(config.api_base + '/healthz', {cache:'no-store', mode:'cors', credentials:'omit', signal});
    if (!healthResponse.ok) return false;
    const health = await healthResponse.json();
    return health.ok === true && health.product_count === 21 && ['database','signing_secret','stripe_webhook_secret','artifacts'].every(key => health.checks?.[key] === true);
  }
  const api = {attribution, checkoutURL, healthy};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (!root.document) return;
  let saved = {};
  try { saved = JSON.parse(root.sessionStorage.getItem('willis_campaign') || '{}'); } catch (_) {}
  const campaign = attribution(root.location.search, saved);
  try { root.sessionStorage.setItem('willis_campaign', JSON.stringify(campaign)); } catch (_) {}
  root.WillisCheckout = api;
  root.document.querySelectorAll('a[data-store-link]').forEach(link => {
    const url = new URL(link.href);
    keys.forEach(key => { if (campaign[key]) url.searchParams.set(key, campaign[key]); });
    link.href = url.href;
  });
  async function refresh() {
    const buttons = [...root.document.querySelectorAll('[data-checkout]')];
    buttons.forEach(button => { button.disabled = true; button.textContent = 'Checking secure delivery…'; });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    let ready = false;
    try { ready = await healthy(root.fetch.bind(root), controller.signal); } catch (_) {} finally { clearTimeout(timer); }
    buttons.forEach(button => {
      button.disabled = !ready;
      button.textContent = ready ? button.dataset.label : 'Checkout temporarily unavailable';
      button.onclick = ready ? () => { root.location.assign(checkoutURL(button.dataset.checkout, campaign, button.dataset.product)); } : null;
    });
    const status = root.document.querySelector('[data-delivery-status]');
    if (status) status.textContent = ready ? 'Secure delivery is online. Pay with Stripe and download after payment is verified.' : 'Secure delivery could not be confirmed. Please retry or email support@scios.site. Payment is disabled here.';
  }
  root.document.querySelectorAll('[data-retry-checkout]').forEach(button => button.addEventListener('click', refresh));
  refresh();
})(typeof window !== 'undefined' ? window : {});
