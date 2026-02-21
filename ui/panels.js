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
        <div class="panelSub">Specialized agents spun up per task · shared memory · policy gates</div>
      </div>
      <div class="badge" id="badgeAgents">READY</div>
    </div>
    <div class="agentGrid">
      ${mk("security","Security Agent","Audit visibility · permission gates · safe recon simulation")}
      ${mk("finance","Finance Agent","Read-only metrics · risk posture · structured snapshots")}
      ${mk("ops","Operations Agent","Workflow plans · rollout checklists · task routing")}
      ${mk("rnd","R&D Agent","Sandbox experiments · evaluation loop · upgrade proposals")}
    </div>
  `;
}

export function consolePanel(){
  return `
    <div class="panelHead">
      <div>
        <div class="panelTitle">System Console</div>
        <div class="panelSub">Terminal stream · timeline · shared memory</div>
      </div>
      <div class="badge" id="badgeConsole">LIVE</div>
    </div>

    <div class="tabs">
      <div class="tab active" data-tab="terminal">Terminal</div>
      <div class="tab" data-tab="timeline">Timeline</div>
      <div class="tab" data-tab="memory">Memory</div>
    </div>

    <div class="consoleBody">
      <pre class="pre" id="outTerminal">Type <span class="mono">Ctrl/⌘ K</span> for command palette.</pre>
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
        <div class="panelSub">Live simulation · signals that feel like an OS</div>
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
      <div class="muted small">This is a safe simulation for investor demo purposes. Real runtime wires to local modules.</div>
    </div>
  `;
}

export function artifactsPanel(state){
  const arts = state.artifacts.slice(-6).reverse().map(a => `
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
        <div class="panelSub">Structured outputs produced by the run</div>
      </div>
      <div class="badge ${state.artifacts.length ? "good":"warn"}" id="badgeArts">${state.artifacts.length ? "READY":"PENDING"}</div>
    </div>
    <div class="artifacts">${arts}</div>
  `;
}
