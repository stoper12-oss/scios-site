import { createState, newRunId } from "./state.js";
import { layoutHTML } from "../ui/layout.js";
import { agentsPanel, consolePanel, telemetryPanel, artifactsPanel } from "../ui/panels.js";
import { commandModalHTML, approvalsModalHTML, gateModalHTML } from "../ui/modals.js";
import { pushLine, terminalText, tl } from "./consoleStream.js";
import { tickTelemetry, drawTelemetry } from "./telemetry.js";
import { runScenario } from "./orchestrator.js";

const root = document.getElementById("appRoot");
const bootRoot = document.getElementById("bootRoot");
const state = createState();

let telemHistory = [];
let telemTimer = null;

function render(){
  root.innerHTML = layoutHTML();
  document.querySelectorAll(".navItem").forEach(n=>{
    n.addEventListener("click", ()=>{
      document.querySelectorAll(".navItem").forEach(x=>x.classList.remove("active"));
      n.classList.add("active");
      tl(state,"c",`View selected: ${n.dataset.view}`);
      flush();
    });
  });

  // panels
  document.getElementById("panelAgents").innerHTML = agentsPanel(state);
  document.getElementById("panelConsole").innerHTML = consolePanel();
  document.getElementById("panelTelemetry").innerHTML = telemetryPanel(state);
  document.getElementById("panelArtifacts").innerHTML = artifactsPanel(state);

  // agent focus clicks
  document.querySelectorAll(".agentCard").forEach(c=>{
    c.addEventListener("click", ()=>{
      state.focusAgent = c.dataset.agent;
      document.querySelectorAll(".agentCard").forEach(x=>x.classList.remove("active"));
      c.classList.add("active");
      tl(state,"c",`Focus: ${state.focusAgent} agent`);
      flush();
    });
  });

  // tabs
  document.querySelectorAll(".tab").forEach(t=>{
    t.addEventListener("click", ()=>{
      document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
      t.classList.add("active");
      const which = t.dataset.tab;
      showTab(which);
    });
  });

  // top buttons
  document.getElementById("btnRun").addEventListener("click", () => startRun());
  document.getElementById("btnCmd").addEventListener("click", () => openCmd());
  document.getElementById("btnApprovals").addEventListener("click", () => openApprovals());
  document.getElementById("btnReset").addEventListener("click", () => resetAll());
  document.getElementById("btnExport").addEventListener("click", () => exportLog());

  // keyboard command palette
  window.addEventListener("keydown", (e)=>{
    const k = e.key.toLowerCase();
    if((e.ctrlKey || e.metaKey) && k === "k"){
      e.preventDefault();
      openCmd();
    }
    if(k === "escape"){
      closeAllModals();
    }
  });

  // update pills
  document.getElementById("pillDeploy").textContent = state.deployment;
  document.getElementById("pillRun").textContent = state.mode;

  // init telemetry loop and draw
  setupTelemetry();
  flush();
}

function showTab(which){
  const t = document.getElementById("outTerminal");
  const tlv = document.getElementById("outTimeline");
  const mem = document.getElementById("outMemory");
  t.style.display = which==="terminal" ? "block":"none";
  tlv.style.display = which==="timeline" ? "block":"none";
  mem.style.display = which==="memory" ? "block":"none";
}

function flush(){
  // console output
  const outT = document.getElementById("outTerminal");
  const outTL = document.getElementById("outTimeline");
  const outM = document.getElementById("outMemory");

  if(outT) outT.textContent = terminalText(state) || `Type Ctrl/⌘ K for command palette.`;
  if(outM) outM.textContent = JSON.stringify(state.memory, null, 2);

  if(outTL){
    outTL.innerHTML = state.timeline.slice(-120).reverse().map(x=>`
      <div class="tRow">
        <span class="tDot ${x.dot}"></span>
        <div>${x.text}<div class="muted small mono">${x.ts}</div></div>
      </div>
    `).join("") || `<div class="muted">No timeline yet.</div>`;
  }

  // badges
  const exportBtn = document.getElementById("btnExport");
  if(exportBtn) exportBtn.disabled = !state.runId;

  // telemetry kpis
  const kCPU = document.getElementById("kCPU");
  const kMEM = document.getElementById("kMEM");
  const kNET = document.getElementById("kNET");
  if(kCPU) kCPU.textContent = `${Math.round(state.telemetry.cpu)}%`;
  if(kMEM) kMEM.textContent = `${Math.round(state.telemetry.mem)}%`;
  if(kNET) kNET.textContent = `${state.telemetry.net.toFixed(1)} Mbps`;

  // chart draw
  const canvas = document.getElementById("telemetryCanvas");
  if(canvas) drawTelemetry(canvas, telemHistory);

  // artifacts panel refresh (lightweight)
  const pa = document.getElementById("panelArtifacts");
  if(pa) pa.innerHTML = artifactsPanel(state);

  // agent states (visual)
  updateAgentMeters();
}

function updateAgentMeters(){
  const map = {
    security: state.permissions.security,
    finance: state.permissions.finance,
    ops: state.permissions.ops,
    rnd: state.permissions.rnd
  };
  const running = state.mode === "running";
  Object.keys(map).forEach(k=>{
    const st = document.getElementById(`st_${k}`);
    const mf = document.getElementById(`mf_${k}`);
    if(!st || !mf) return;
    if(!map[k]){
      st.textContent = "disabled";
      mf.style.width = "0%";
      return;
    }
    if(state.mode==="idle"){ st.textContent="idle"; mf.style.width="0%"; return; }
    if(state.mode==="completed"){ st.textContent="complete"; mf.style.width="100%"; return; }
    // running
    st.textContent = running ? "running" : state.mode;
    mf.style.width = `${40 + Math.random()*55}%`;
  });
}

function setupTelemetry(){
  if(telemTimer) return;
  // seed history
  telemHistory = [];
  for(let i=0;i<60;i++){
    telemHistory.push({ cpu: state.telemetry.cpu, mem: state.telemetry.mem, net: state.telemetry.net });
  }
  telemTimer = setInterval(()=>{
    tickTelemetry(state);
    telemHistory.push({ cpu: state.telemetry.cpu, mem: state.telemetry.mem, net: state.telemetry.net });
    telemHistory = telemHistory.slice(-80);
    flush();
  }, 260);
}

async function bootSequence(){
  document.body.classList.add("bootOn");
  bootRoot.innerHTML = `
    <div class="bootBackdrop"></div>
    <div class="bootCard">
      <div class="bootTitle">SCIOS initializing…</div>
      <div class="bootSub">Operating System identity · Business workflows · Security-first</div>
      <div class="bootLines" id="bootLines"></div>
      <div class="bootBar"><div class="bootFill" id="bootFill"></div></div>
    </div>
  `;
  const linesEl = document.getElementById("bootLines");
  const fill = document.getElementById("bootFill");

  const lines = [
    "[kernel] init subsystems",
    "[orchestrator] load plans",
    "[policy] enable gates + audit",
    "[memory] seal shared memory",
    "[ui] render workspace"
  ];

  for(let i=0;i<lines.length;i++){
    linesEl.textContent += (i? "\n":"") + lines[i];
    fill.style.width = `${Math.round(((i+1)/lines.length)*100)}%`;
    await sleep(260);
  }
  await sleep(420);
  document.body.classList.remove("bootOn");
  bootRoot.innerHTML = "";
}

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

function closeAllModals(){
  ["modalCmd","modalApprovals","modalGate"].forEach(id=>{
    const m = document.getElementById(id);
    if(m) m.classList.remove("open");
    if(m) m.innerHTML = "";
  });
}

function openCmd(){
  const m = document.getElementById("modalCmd");
  m.classList.add("open");
  m.innerHTML = commandModalHTML();

  m.querySelectorAll("[data-close='1']").forEach(x=>x.addEventListener("click", ()=>closeAllModals()));
  m.querySelectorAll("[data-cmd]").forEach(b=>{
    b.addEventListener("click", ()=>{
      runCommand(b.getAttribute("data-cmd"));
      closeAllModals();
    });
  });

  const input = document.getElementById("cmdInput");
  const runBtn = document.getElementById("cmdRunBtn");

  setTimeout(()=>input.focus(), 0);

  input.addEventListener("keydown",(e)=>{
    if(e.key==="Enter"){
      runCommand(input.value.trim());
      closeAllModals();
    }
  });
  runBtn.addEventListener("click", ()=>{
    runCommand(input.value.trim());
    closeAllModals();
  });
}

function openApprovals(){
  const m = document.getElementById("modalApprovals");
  m.classList.add("open");
  m.innerHTML = approvalsModalHTML(state);

  m.querySelectorAll("[data-close='1']").forEach(x=>x.addEventListener("click", ()=>closeAllModals()));

  // toggles
  const bindPerm = (key)=>{
    const el = document.getElementById(`perm_${key}`);
    el.addEventListener("change", ()=>{
      state.permissions[key] = !!el.checked;
      tl(state,"w",`Permission changed: ${key}=${state.permissions[key]}`);
      flush();
    });
  };
  ["security","finance","ops","rnd"].forEach(bindPerm);

  const ap = document.getElementById("approvalsOn");
  ap.addEventListener("change", ()=>{
    state.approvalsOn = !!ap.checked;
    tl(state,"w",`Approvals ${state.approvalsOn ? "enabled":"disabled"}`);
    flush();
  });

  document.getElementById("depLocal").addEventListener("click", ()=>{
    state.deployment = "local-first";
    tl(state,"c","Deployment set to local-first");
    flush();
  });
  document.getElementById("depHybrid").addEventListener("click", ()=>{
    state.deployment = "hybrid";
    tl(state,"c","Deployment set to hybrid");
    flush();
  });

  document.getElementById("lockdownBtn").addEventListener("click", ()=>{
    state.permissions = { security:false, finance:false, ops:false, rnd:false };
    state.approvalsOn = true;
    tl(state,"w","Lockdown enabled (all agents disabled)");
    closeAllModals(); flush();
  });

  document.getElementById("enableAllBtn").addEventListener("click", ()=>{
    state.permissions = { security:true, finance:true, ops:true, rnd:true };
    state.approvalsOn = true;
    tl(state,"g","All agents enabled");
    closeAllModals(); flush();
  });
}

async function gate(payload){
  if(!state.approvalsOn){
    tl(state,"w",`Gate bypassed (approvals off): ${payload.action}`);
    pushLine(state, `[policy] auto-approved: ${payload.action} (approvals off)`);
    return true;
  }

  const m = document.getElementById("modalGate");
  m.classList.add("open");
  m.innerHTML = gateModalHTML(payload);

  return await new Promise((resolve)=>{
    m.querySelector("#gateDeny").addEventListener("click", ()=>{
      closeAllModals();
      pushLine(state, `[policy] denied: ${payload.action}`);
      tl(state,"w",`Denied: ${payload.action}`);
      resolve(false);
    });
    m.querySelector("#gateApprove").addEventListener("click", ()=>{
      closeAllModals();
      pushLine(state, `[policy] approved: ${payload.action}`);
      tl(state,"w",`Approved: ${payload.action}`);
      resolve(true);
    });
  });
}

async function startRun(){
  if(state.mode==="running") return;
  state.runId = newRunId();
  state.mode = "running";
  state.terminal = [];
  state.timeline = [];
  state.artifacts = [];
  state.kpis = { prompts:0, artifacts:0, audit:0 };
  state.memory = { run_id: state.runId, created_ts: new Date().toISOString(), deployment: state.deployment };

  await bootSequence();
  pushLine(state, `run_id=${state.runId}`);
  tl(state,"c",`Run started: ${state.runId}`);
  flush();

  await runScenario(state, async (payload)=>{
    state.kpis.prompts++;
    flush();
    return await gate(payload);
  });

  flush();
}

function resetAll(){
  state.runId = null;
  state.mode = "idle";
  state.terminal = [];
  state.timeline = [];
  state.artifacts = [];
  state.kpis = { prompts:0, artifacts:0, audit:0 };
  state.memory = {};
  tl(state,"c","System reset");
  flush();
}

function exportLog(){
  if(!state.runId) return;
  const run_log = {
    run_id: state.runId,
    deployment: state.deployment,
    approvals: state.approvalsOn,
    permissions: state.permissions,
    timeline: state.timeline,
    terminal: state.terminal,
    artifacts: state.artifacts,
    exported_ts: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(run_log,null,2)], { type:"application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "run_log.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function runCommand(cmd){
  const c = (cmd||"").trim().toLowerCase();
  if(!c) return;

  if(c==="export"){ exportLog(); return; }
  if(c==="full.run"){ await startRun(); return; }

  if(!state.runId){
    // quick boot for single commands
    state.runId = newRunId();
    state.mode = "running";
    state.terminal = [];
    state.timeline = [];
    state.artifacts = [];
    state.memory = { run_id: state.runId, created_ts: new Date().toISOString(), deployment: state.deployment };
    await bootSequence();
  }

  pushLine(state, `\n$ ${c}`);
  tl(state,"c",`Command: ${c}`);
  flush();

  // route: run scenario but short-circuit behavior by calling orchestrator with different entry
  if(c==="security.scan"){
    state.mode="running";
    await runScenario(state, async (payload)=>await gate(payload));
  } else if(c==="finance.snapshot" || c==="ops.plan" || c==="rnd.experiment"){
    state.mode="running";
    await runScenario(state, async (payload)=>await gate(payload));
  } else {
    pushLine(state, `[error] unknown command: ${c}`);
  }
  state.mode="completed";
  flush();
}

// init
render();
bootSequence().then(()=>{
  pushLine(state, `[system] ready — Ctrl/⌘ K opens command palette`);
  tl(state,"g","System ready");
  flush();
});
