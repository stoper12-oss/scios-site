import { createState, newRunId } from "./state.js";
import { layoutHTML } from "../ui/layout.js";
import { agentsPanel, consolePanel, telemetryPanel, artifactsPanel } from "../ui/panels.js";
import { commandModalHTML, approvalsModalHTML, gateModalHTML } from "../ui/modals.js";
import { pushLine, tl } from "./consoleStream.js";
import { terminalHTML } from "./format.js";
import { tickTelemetry, drawTelemetry } from "./telemetry.js";
import { runScenario } from "./orchestrator.js";

const root = document.getElementById("appRoot");
const bootRoot = document.getElementById("bootRoot");
const state = createState();

// theme persist
const savedTheme = localStorage.getItem("scios_theme") || "dark";
if(savedTheme === "light") document.body.classList.add("light");

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

  document.getElementById("panelAgents").innerHTML = agentsPanel(state);
  document.getElementById("panelConsole").innerHTML = consolePanel();
  document.getElementById("panelTelemetry").innerHTML = telemetryPanel(state);
  document.getElementById("panelArtifacts").innerHTML = artifactsPanel(state);

  document.querySelectorAll(".agentCard").forEach(c=>{
    c.addEventListener("click", ()=>{
      state.focusAgent = c.dataset.agent;
      document.querySelectorAll(".agentCard").forEach(x=>x.classList.remove("active"));
      c.classList.add("active");
      tl(state,"c",`Focus: ${state.focusAgent} agent`);
      flush();
    });
  });

  document.querySelectorAll(".tab").forEach(t=>{
    t.addEventListener("click", ()=>{
      document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
      t.classList.add("active");
      showTab(t.dataset.tab);
    });
  });

  document.getElementById("btnTheme").addEventListener("click", () => toggleTheme());
  document.getElementById("btnRun").addEventListener("click", () => { state.scenario="full"; startRun(); });
  document.getElementById("btnDemo").addEventListener("click", () => exampleDemo());
  document.getElementById("btnCmd").addEventListener("click", () => openCmd());
  document.getElementById("btnApprovals").addEventListener("click", () => openApprovals());
  document.getElementById("btnReset").addEventListener("click", () => resetAll());
  document.getElementById("btnExport").addEventListener("click", () => exportLog());

  // presets
  document.getElementById("presetSec").addEventListener("click", ()=>{ state.scenario="security"; startRun(); });
  document.getElementById("presetBiz").addEventListener("click", ()=>{ state.scenario="ops"; startRun(); });
  document.getElementById("presetFin").addEventListener("click", ()=>{ state.scenario="finance"; startRun(); });
  document.getElementById("presetFull").addEventListener("click", ()=>{ state.scenario="full"; startRun(); });

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

  setupTelemetry();
  flush();
}

function toggleTheme(){
  document.body.classList.toggle("light");
  const mode = document.body.classList.contains("light") ? "light" : "dark";
  localStorage.setItem("scios_theme", mode);
  tl(state, "c", `Theme: ${mode}`);
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
  const outT = document.getElementById("outTerminal");
  const outTL = document.getElementById("outTimeline");
  const outM = document.getElementById("outMemory");

  if(outT) outT.innerHTML = terminalHTML(state);
  if(outM) outM.textContent = JSON.stringify(state.memory, null, 2);

  if(outTL){
    outTL.innerHTML = state.timeline.slice(-120).reverse().map(x=>`
      <div class="tRow">
        <span class="tDot ${x.dot}"></span>
        <div>${x.text}<div class="muted small mono">${x.ts}</div></div>
      </div>
    `).join("") || `<div class="muted">No timeline yet.</div>`;
  }

  const exportBtn = document.getElementById("btnExport");
  if(exportBtn) exportBtn.disabled = !state.runId;

  const kCPU = document.getElementById("kCPU");
  const kMEM = document.getElementById("kMEM");
  const kNET = document.getElementById("kNET");
  if(kCPU) kCPU.textContent = `${Math.round(state.telemetry.cpu)}%`;
  if(kMEM) kMEM.textContent = `${Math.round(state.telemetry.mem)}%`;
  if(kNET) kNET.textContent = `${state.telemetry.net.toFixed(1)} Mbps`;

  const canvas = document.getElementById("telemetryCanvas");
  if(canvas) drawTelemetry(canvas, telemHistory);

  const pa = document.getElementById("panelArtifacts");
  if(pa) pa.innerHTML = artifactsPanel(state);

  // rerender agents panel to refresh summary quickly
  const agents = document.getElementById("panelAgents");
  if(agents) agents.innerHTML = agentsPanel(state);
  bindAgentClicksAgain();

  updateAgentMeters();

  const pillRun = document.getElementById("pillRun");
  if(pillRun) pillRun.textContent = state.mode;
  const pillDep = document.getElementById("pillDeploy");
  if(pillDep) pillDep.textContent = state.deployment;
}

function bindAgentClicksAgain(){
  document.querySelectorAll(".agentCard").forEach(c=>{
    c.addEventListener("click", ()=>{
      state.focusAgent = c.dataset.agent;
      document.querySelectorAll(".agentCard").forEach(x=>x.classList.remove("active"));
      c.classList.add("active");
      tl(state,"c",`Focus: ${state.focusAgent} agent`);
      flush();
    });
  });
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
    st.textContent = running ? "running" : state.mode;
    mf.style.width = `${40 + Math.random()*55}%`;
  });
}

function setupTelemetry(){
  if(telemTimer) return;

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
      <div class="bootSub">Local-first · Security + Finance + Ops</div>
      <div class="bootLines" id="bootLines"></div>
      <div class="bootBar"><div class="bootFill" id="bootFill"></div></div>
    </div>
  `;
  const linesEl = document.getElementById("bootLines");
  const fill = document.getElementById("bootFill");

  const lines = [
    "[kernel] init subsystems",
    "[orchestrator] load scenarios",
    "[policy] enable gates + audit",
    "[memory] seal shared memory",
    "[ui] render workspace"
  ];

  for(let i=0;i<lines.length;i++){
    linesEl.textContent += (i? "\n":"") + lines[i];
    fill.style.width = `${Math.round(((i+1)/lines.length)*100)}%`;
    await sleep(220);
  }
  await sleep(380);
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
    closeAllModals(); flush();
  });
  document.getElementById("depHybrid").addEventListener("click", ()=>{
    state.deployment = "hybrid";
    tl(state,"c","Deployment set to hybrid");
    closeAllModals(); flush();
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
    tl(state,"w",`Gate bypassed: ${payload.action}`);
    pushLine(state, `[policy] auto-approved: ${payload.action}`, "ok");
    return true;
  }

  const m = document.getElementById("modalGate");
  m.classList.add("open");
  m.innerHTML = gateModalHTML(payload);

  return await new Promise((resolve)=>{
    m.querySelector("#gateDeny").addEventListener("click", ()=>{
      closeAllModals();
      pushLine(state, `[policy] denied: ${payload.action}`, "warn");
      tl(state,"w",`Denied: ${payload.action}`);
      resolve(false);
    });
    m.querySelector("#gateApprove").addEventListener("click", ()=>{
      closeAllModals();
      pushLine(state, `[policy] approved: ${payload.action}`, "ok");
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
  state.memory = {
    run_id: state.runId,
    created_ts: new Date().toISOString(),
    deployment: state.deployment,
    scenario: state.scenario
  };

  await bootSequence();
  pushLine(state, `run_id=${state.runId}`, "info");
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
    scenario: state.scenario,
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
  if(c==="full.run"){ state.scenario="full"; await startRun(); return; }
  if(c==="security.audit"){ state.scenario="security"; await startRun(); return; }
  if(c==="finance.snapshot"){ state.scenario="finance"; await startRun(); return; }
  if(c==="ops.plan"){ state.scenario="ops"; await startRun(); return; }
  if(c==="rnd.experiment"){ state.scenario="full"; await startRun(); return; }

  pushLine(state, `[error] unknown command: ${c}`, "bad");
  flush();
}

function exampleDemo(){
  // clean, investor-friendly: set to full + approvals on + hybrid optional OFF by default
  state.approvalsOn = true;
  state.permissions = { security:true, finance:true, ops:true, rnd:true };
  state.deployment = "local-first";
  state.scenario = "full";
  tl(state,"g","EXAMPLE DEMO initiated");
  startRun();
}

render();
bootSequence().then(()=>{
  pushLine(state, `[system] ready — Ctrl/⌘ K opens command palette`, "ok");
  tl(state,"g","System ready");
  flush();
});
