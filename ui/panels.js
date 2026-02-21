export function agentsPanel(state){
  const mk = (id, title, desc) => `
    <div class="agentCard ${state.focusAgent===id ? "active":""}" data-agent="${id}">
      <div class="agentTop">
        <div class="agentName">${title}</div>
        <div class="agentState" id="st_${id}">idle</div>
      </div>
      <div class="agentDesc">${desc}</div>
      <div class="meter"><div class="meterFill" id="mf_${id}"></div></div>
    </div>
  `;

  return `
    <div class="panelHead">
      <div>
        <div class="panelTitle">Agent Runtime</div>
        <div class="panelSub">One click → specialized agents activate with shared memory + approvals</div>
      </div>
      <div class="badge" id="badgeAgents">${state.mode==="running" ? "RUNNING" : "READY"}</div>
    </div>

    <div class="agentGrid">
      ${mk("security","Security Agent","Audit visibility · permission gates · safe recon simulation")}
      ${mk("finance","Finance Agent","Read-only metrics · risk posture · structured snapshots")}
      ${mk("ops","Operations Agent","Workflow plans · rollout checklists · task routing")}
      ${mk("rnd","R&D Agent","Sandbox experiments · evaluation loop · upgrade proposals")}
    </div>

    <div class="runSummary">
      <div class="panelTitle" style="font-size:13px;">Run Summary</div>
      <div class="sumGrid">
        <div class="sumCard"><div class="sumK">Run ID</div><div class="sumV mono">${state.runId || "—"}</div></div>
        <div class="sumCard"><div class="sumK">Approvals</div><div class="sumV">${state.approvalsOn ? "ON" : "OFF"}</div></div>
        <div class="sumCard"><div class="sumK">Artifacts</div><div class="sumV">${state.artifacts.length}</div></div>
      </div>
      <div class="muted small">This is a demo UI. Real deployments keep data local by default.</div>
    </div>
  `;
}

export function consolePanel(){
  return `
    <div class="panelHead">
      <div>
        <div class="panelTitle">System Console</div>
        <div class="panelSub">Timestamped logs · status tags · credible output</div>
      </div>
      <div class="badge good" id="badgeConsole">LIVE</div>
    </div>

    <div class="tabs">
      <div class="tab active" data-tab="terminal">Terminal</div>
      <div class="tab" data-tab="timeline">Timeline</div>
      <div class="tab" data-tab="memory">Memory</div>
    </div>

    <div class="consoleBody">
      <pre class="pre" id="outTerminal">Type Ctrl/⌘ K for command palette.</pre>
      <div class="timeline" id="outTimeline" style="display:none;"></div>
      <pre class="pre" id="outMemory" style="display:none;">{}</pre>
    </div>
  `;
}

export function telemetryPanel(state){
  return `
    <div class="panelHead">
      <div>
        <div class="panelTitle">Telemetry</div>
        <div class="panelSub">Live simulation · reads like an OS runtime</div>
      </div>
      <div class="badge good" id="badgeTelem">STABLE</div>
    </div>

    <div style="padding:14px;display:grid;gap:10px;">
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
        <div class="art"><div class="artK">CPU</div><div class="artV mono" id="kCPU">${state.telemetry.cpu}%</div></div>
        <div class="art"><div class="artK">MEM</div><div class="artV mono" id="kMEM">${state.telemetry.mem}%</div></div>
        <div class="art"><div class="artK">NET</div><div class="artV mono" id="kNET">${state.telemetry.net} Mbps</div></div>
      </div>
      <canvas id="telemetryCanvas" width="900" height="240"></canvas>
      <div class="muted small">Safe simulation for investor demo. Real runtime wires to local modules.</div>
    </div>
  `;
}

export function artifactsPanel(state){
  const arts = state.artifacts.slice(-8).reverse().map(a => `
    <div class="art">
      <div class="artK">${a.type}</div>
      <div class="artV">${a.summary}</div>
      <div class="muted small mono">${a.ts}</div>
    </div>
  `).join("") || `<div class="muted">No artifacts yet. Run a scenario.</div>`;

  return `
    <div class="panelHead">
      <div>
        <div class="panelTitle">Artifacts</div>
        <div class="panelSub">Structured deliverables produced by the run</div>
      </div>
      <div class="badge ${state.artifacts.length ? "good":"warn"}">${state.artifacts.length ? "READY":"PENDING"}</div>
    </div>
    <div class="artifacts">${arts}</div>
  `;
}
