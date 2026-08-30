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
  const revealNodes = document.querySelectorAll("[data-reveal]");
  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { revealNodes.forEach(node => node.classList.add("revealed")); return; }
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("revealed"); observer.unobserve(entry.target); } }), { threshold: 0.12 });
  revealNodes.forEach(node => observer.observe(node));
})();
