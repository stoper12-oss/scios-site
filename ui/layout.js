export function layoutHTML(){
  return `
  <div class="topbar">
    <div class="brand">
      <div class="logo"></div>
      <div>
        <div class="brandTitle">SCIOS by Willis Hartin</div>
        <div class="brandSub">Local-first AI Command Hub · Security + Finance + Ops</div>
      </div>
    </div>

    <div class="actions">
      <span class="pill" id="pillDeploy">local-first</span>
      <span class="pill" id="pillRun">idle</span>

      <button class="btn" id="btnTheme" title="Toggle Daylight Mode">Daylight</button>
      <button class="btn btnPrimary" id="btnRun">RUN SCENARIO</button>
      <button class="btn" id="btnDemo">EXAMPLE DEMO</button>
      <button class="btn" id="btnCmd">Command <span class="kbd">Ctrl/⌘ K</span></button>
      <button class="btn" id="btnApprovals">Approvals</button>
      <button class="btn btnWarn" id="btnReset">Reset</button>
      <button class="btn btnGood" id="btnExport" disabled>Export log</button>
    </div>
  </div>

  <div class="workspace">
    <aside class="sidebar">
      <div class="sideHead">
        <div class="panelTitle">Investor Walkthrough</div>
        <div class="panelSub">Pick a scenario · watch the agents spin up</div>
      </div>

      <div class="nav">
        <div class="navItem active" data-view="overview">Overview</div>
        <div class="navItem" data-view="orchestrator">Orchestrator</div>
        <div class="navItem" data-view="security">Security</div>
        <div class="navItem" data-view="finance">Finance</div>
        <div class="navItem" data-view="ops">Operations</div>
        <div class="navItem" data-view="rnd">R&D</div>
      </div>

      <div style="padding:10px;display:grid;gap:10px;">
        <div class="panelTitle" style="font-size:13px;">Scenario Presets</div>
        <button class="btn" id="presetSec">Security Audit</button>
        <button class="btn" id="presetBiz">Business Ops</button>
        <button class="btn" id="presetFin">Finance Snapshot</button>
        <button class="btn" id="presetFull">Full Platform Run</button>
        <div class="muted small">These are safe simulations for demo. Real wiring targets local modules.</div>
      </div>
    </aside>

    <section class="centerCol">
      <div class="panel" id="panelAgents"></div>
      <div class="panel" id="panelConsole"></div>
    </section>

    <section class="rightCol">
      <div class="panel" id="panelTelemetry"></div>
      <div class="panel" id="panelArtifacts"></div>
    </section>
  </div>

  <div class="modal" id="modalCmd"></div>
  <div class="modal" id="modalApprovals"></div>
  <div class="modal" id="modalGate"></div>
  `;
}
