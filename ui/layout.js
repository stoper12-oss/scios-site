export function layoutHTML(){
  return `
  <div class="topbar">
    <div class="brand">
      <div class="logo"></div>
      <div>
        <div class="brandTitle">SCIOS</div>
        <div class="brandSub">Platform Prototype · Command Hub · Local-first</div>
      </div>
    </div>

    <div class="actions">
      <span class="pill" id="pillDeploy">local-first</span>
      <span class="pill" id="pillRun">idle</span>
      <button class="btn btnPrimary" id="btnRun">RUN SCENARIO</button>
      <button class="btn" id="btnCmd">Command <span class="kbd">Ctrl/⌘ K</span></button>
      <button class="btn" id="btnApprovals">Approvals</button>
      <button class="btn btnWarn" id="btnReset">Reset</button>
      <button class="btn btnGood" id="btnExport" disabled>Export log</button>
    </div>
  </div>

  <div class="workspace">
    <aside class="sidebar">
      <div class="sideHead">
        <div class="panelTitle">Workspace</div>
        <div class="panelSub">Operating System identity · Business workflows · Security-first</div>
      </div>
      <div class="nav">
        <div class="navItem active" data-view="overview">Overview</div>
        <div class="navItem" data-view="orchestrator">Orchestrator</div>
        <div class="navItem" data-view="security">Security</div>
        <div class="navItem" data-view="finance">Finance</div>
        <div class="navItem" data-view="ops">Operations</div>
        <div class="navItem" data-view="rnd">R&D</div>
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
