(() => {
  const form = document.querySelector("[data-custom-request]");
  const status = document.querySelector("[data-request-status]");
  if (!form) return;

  const query = new URLSearchParams(window.location.search);
  const requestedItem = query.get("service") || query.get("addon") || "";
  if (requestedItem) {
    const type = form.elements.request_type;
    type.value = query.has("addon") ? "Venture add-on" : "New paid service";
    form.elements.capabilities.value = requestedItem.replaceAll("-", " ");
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const fields = [
      ["Name", data.get("name")],
      ["Work email", data.get("email")],
      ["Organization", data.get("organization")],
      ["Request type", data.get("request_type")],
      ["Requested outcome", data.get("outcome")],
      ["Capabilities or integrations", data.get("capabilities") || "Not specified"],
      ["Expected users", data.get("users") || "Not specified"],
      ["Target timing", data.get("timing")],
      ["Budget range", data.get("budget")],
      ["Existing SCIOS service", data.get("existing_service") || "None / not specified"],
      ["Security, privacy, or data requirements", data.get("requirements") || "Not specified"]
    ];
    const subject = `Custom SCIOS request — ${String(data.get("organization")).trim()}`;
    const body = fields.map(([label, value]) => `${label}:\n${String(value).trim()}\n`).join("\n");
    const mailto = `mailto:support@scios.site?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (status) status.textContent = "Your email application should open with the request. Review it before sending.";
    window.location.href = mailto;
  });
})();
