export function commandModalHTML(){
  return `
  <div class="modalBackdrop" data-close="1"></div>
  <div class="modalPanel">
    <div class="modalHead">
      <div>
        <div class="modalTitle">Command Palette</div>
        <div class="modalSub">Type a command. Enter to run. Esc to close.</div>
      </div>
      <button class="btn" data-close="1">Close</button>
    </div>
    <div class="modalBody">
      <input id="cmdInput" style="width:100%;padding:12px;border-radius:14px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.25);color:var(--text);font-weight:900;outline:none"
        placeholder="Try: full.run  |  security.scan  |  finance.snapshot  |  ops.plan  |  rnd.experiment  |  export" />
      <div class="grid2" style="margin-top:12px;">
        <button class="btn" data-cmd="full.run">full.run</button>
        <button class="btn" data-cmd="security.scan">security.scan</button>
        <button class="btn" data-cmd="finance.snapshot">finance.snapshot</button>
        <button class="btn" data-cmd="ops.plan">ops.plan</button>
        <button class="btn" data-cmd="rnd.experiment">rnd.experiment</button>
        <button class="btn btnGood" data-cmd="export">export</button>
      </div>
    </div>
    <div class="modalFoot">
      <span class="muted small">Shortcut: <span class="kbd">Ctrl</span> + <span class="kbd">K</span> / <span class="kbd">⌘</span> + <span class="kbd">K</span></span>
      <button class="btn btnPrimary" id="cmdRunBtn">Run</button>
    </div>
  </div>
  `;
}

export function approvalsModalHTML(state){
  const row = (k, id) => `
    <div class="art" style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
      <div>
        <div class="artK">${k}</div>
        <div class="muted small">Enable/disable agent participation</div>
      </div>
      <label style="display:flex;gap:10px;align-items:center;">
        <input type="checkbox" id="${id}" ${state.permissions[id.replace("perm_","")] ? "checked":""} />
      </label>
    </div>
  `;
  return `
  <div class="modalBackdrop" data-close="1"></div>
  <div class="modalPanel">
    <div class="modalHead">
      <div>
        <div class="modalTitle">Approvals & Permissions</div>
        <div class="modalSub">Enterprise control signal: approvals gate sensitive actions.</div>
      </div>
      <button class="btn" data-close="1">Close</button>
    </div>
    <div class="modalBody">
      <div class="grid2">
        ${row("Security Agent","perm_security")}
        ${row("Finance Agent","perm_finance")}
        ${row("Operations Agent","perm_ops")}
        ${row("R&D Agent","perm_rnd")}
      </div>

      <div class="art" style="margin-top:10px;display:flex;align-items:center;justify-content:space-between;gap:10px;">
        <div>
          <div class="artK">Require approvals for gated actions</div>
          <div class="muted small">When ON, sensitive steps prompt you to approve/deny.</div>
        </div>
        <input type="checkbox" id="approvalsOn" ${state.approvalsOn ? "checked":""}/>
      </div>

      <div class="art" style="margin-top:10px;">
        <div class="artK">Deployment Mode</div>
        <div class="muted small">Local-first by default; hybrid is optional for real integrations.</div>
        <div style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap;">
          <button class="btn" id="depLocal">Local-first</button>
          <button class="btn" id="depHybrid">Hybrid</button>
        </div>
      </div>
    </div>
    <div class="modalFoot">
      <button class="btn btnWarn" id="lockdownBtn">Lockdown</button>
      <button class="btn btnGood" id="enableAllBtn">Enable All</button>
    </div>
  </div>
  `;
}

export function gateModalHTML(payload){
  return `
  <div class="modalBackdrop"></div>
  <div class="modalPanel">
    <div class="modalHead">
      <div>
        <div class="modalTitle">Operator Approval Required</div>
        <div class="modalSub">${payload.reason}</div>
      </div>
      <span class="badge warn mono">policy://gate</span>
    </div>
    <div class="modalBody">
      <div class="art"><div class="artK">Requested action</div><div class="artV mono">${payload.action}</div></div>
      <div class="art" style="margin-top:10px;"><div class="artK">Scope</div><div class="artV">Safe simulation (demo) — no invasive instructions.</div></div>
    </div>
    <div class="modalFoot">
      <button class="btn btnWarn" id="gateDeny">Deny</button>
      <button class="btn btnGood" id="gateApprove">Approve</button>
    </div>
  </div>
  `;
}
