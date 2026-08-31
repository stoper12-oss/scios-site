(() => {
  const header = document.querySelector("[data-header]");
  const menu = document.querySelector("[data-menu]");
  const nav = document.querySelector("[data-nav]");
  const syncHeader = () => header?.classList.toggle("scrolled", window.scrollY > 12);
  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });
  menu?.addEventListener("click", () => {
    const open = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(open));
    nav?.classList.toggle("open", open);
    header?.classList.toggle("menu-open", open);
  });
  nav?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    menu?.setAttribute("aria-expanded", "false"); nav.classList.remove("open"); header?.classList.remove("menu-open");
  }));
  document.querySelectorAll("[data-year]").forEach(node => { node.textContent = String(new Date().getFullYear()); });
  const catalog = document.querySelector("[data-products]");
  const renderCatalog = products => {
    if (!catalog || !Array.isArray(products) || products.length === 0) return;
    const cards = products.filter(product => product && product.active !== false).map(product => {
      const card = document.createElement("article");
      card.className = `plan-card${product.featured ? " plan-featured" : ""}`;
      const badge = document.createElement("span"); badge.className = "plan-badge"; badge.textContent = product.badge || "Available";
      const kicker = document.createElement("p"); kicker.className = "card-kicker"; kicker.textContent = product.category || "SCIOS plan";
      const title = document.createElement("h3"); title.textContent = product.name || "SCIOS service";
      const price = document.createElement("p"); price.className = "plan-price"; price.textContent = product.price_label || "Price shown at checkout";
      const description = document.createElement("small"); description.textContent = product.description || ""; price.append(description);
      const features = document.createElement("ul");
      (Array.isArray(product.features) ? product.features : []).forEach(value => { const item = document.createElement("li"); item.textContent = String(value); features.append(item); });
      const checkout = document.createElement("a"); checkout.className = "button button-primary"; checkout.textContent = "Continue to secure checkout →";
      const checkoutUrl = String(product.checkout_url || "");
      if (/^https:\/\/(buy|checkout)\.stripe\.com\//.test(checkoutUrl)) { checkout.href = checkoutUrl; checkout.rel = "noopener noreferrer"; }
      else { checkout.href = "mailto:support@scios.site?subject=SCIOS%20plan%20inquiry"; checkout.textContent = "Ask about this plan"; }
      card.append(badge, kicker, title, price, features, checkout); return card;
    });
    if (cards.length) catalog.replaceChildren(...cards);
  };
  if (catalog) fetch("products.json", { cache: "no-store" }).then(response => response.ok ? response.json() : null).then(data => renderCatalog(data?.products)).catch(() => {});
  const revealNodes = document.querySelectorAll("[data-reveal]");
  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { revealNodes.forEach(node => node.classList.add("revealed")); return; }
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("revealed"); observer.unobserve(entry.target); } }), { threshold: 0.12 });
  revealNodes.forEach(node => observer.observe(node));
})();
