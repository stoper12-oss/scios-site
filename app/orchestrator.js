import { pushLine, tl } from "./consoleStream.js";

const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));

export async function runScenario(state, gate){
  state.mode = "running";
  state.artifacts = [];
  state.kpis.artifacts = 0;

  pushLine(state, `[command_hub] submit task=${state.scenario}`, "cmd");
  tl(state, "c", `Scenario submitted: ${state.scenario}`);
  await sleep(180);

  pushLine(state, `[boot] kernel init`, "info");
  tl(state, "p", "Boot: kernel init");
  await sleep(220);

  pushLine(state, `[boot] orchestrator online`, "ok");
  tl(state, "p", "Boot: orchestrator online");
  await sleep(240);

  pushLine(state, `[boot] policy loaded (${state.deployment}) approvals=${state.approvalsOn ? "on":"off"}`, "info");
  tl(state, "p", "Boot: policy loaded");
  await sleep(240);

  if(state.scenario==="security"){
    await agentSecurity(state, gate);
  } else if(state.scenario==="finance"){
    await agentFinance(state, gate);
  } else if(state.scenario==="ops"){
    await agentOps(state, gate);
  } else {
    await agentSecurity(state, gate);
    await agentFinance(state, gate);
    await agentOps(state, gate);
    await agentRnd(state, gate);
  }

  pushLine(state, `[report] emit executive summary`, "info");
  tl(state, "g", "Reporter emitted executive summary");
  await sleep(220);

  artifact(state, "Executive Summary", "One click orchestrated specialized agents with approvals, audit visibility, telemetry, and exportable run log.");
  artifact(state, "Run Report", buildReport(state));

  pushLine(state, `[orchestrator] run complete ✓`, "ok");
  tl(state, "g", "Orchestrator run complete");
  state.mode = "completed";
}

function artifact(state, type, summary){
  state.artifacts.push({ type, summary, ts: new Date().toISOString() });
  state.kpis.artifacts++;
}

async function agentSecurity(state, gate){
  if(!state.permissions.security){
    pushLine(state, `[security_agent] skipped (disabled)`, "warn");
    tl(state, "w", "Security agent skipped");
    return;
  }
  pushLine(state, `== security_agent ==`, "info");
  pushLine(state, `$ recon.audit --scope local_surface --mode safe`, "cmd");
  tl(state, "p", "Security agent started");
  await sleep(260);

  const ok = await gate({ action: "security.safe_audit", reason: "Validate baseline exposure (simulation only)." });
  if(!ok){
    pushLine(state, `[security_agent] blocked by policy`, "warn");
    tl(state, "w", "Security blocked");
    artifact(state,"Security Snapshot","Blocked by operator policy gate.");
    return;
  }

  pushLine(state, `[recon] interfaces: lo, wlan0, eth0 (simulated)`, "info");
  await sleep(220);
  pushLine(state, `[recon] baseline exposure: low (demo)`, "ok");
  await sleep(200);
  artifact(state, "Security Snapshot", "Exposure low (demo). Policy gates and audit logging verified.");
  tl(state, "g", "Security artifact created");
}

async function agentFinance(state, gate){
  if(!state.permissions.finance){
    pushLine(state, `[finance_agent] skipped (disabled)`, "warn");
    tl(state, "w", "Finance skipped");
    return;
  }
  pushLine(state, `== finance_agent ==`, "info");
  pushLine(state, `$ finance.snapshot --readonly`, "cmd");
  tl(state, "p", "Finance agent started");
  await sleep(240);

  const ok = await gate({ action: "finance.readonly_metrics", reason: "Generate read-only KPI snapshot (no funds moved)." });
  if(!ok){
    pushLine(state, `[finance_agent] blocked by policy`, "warn");
    tl(state, "w", "Finance blocked");
    artifact(state,"Finance Snapshot","Blocked by operator policy gate.");
    return;
  }

  const risk = Math.floor(74 + Math.random()*20);
  const runway = Math.floor(6 + Math.random()*14);
  pushLine(state, `[finance] risk_score=${risk}/100 runway=${runway}mo (demo)`, "info");
  await sleep(220);
  artifact(state, "Finance Snapshot", `risk_score=${risk}/100, runway=${runway} months (demo).`);
  tl(state, "g", "Finance artifact created");
}

async function agentOps(state, gate){
  if(!state.permissions.ops){
    pushLine(state, `[ops_agent] skipped (disabled)`, "warn");
    tl(state, "w", "Ops skipped");
    return;
  }
  pushLine(state, `== operations_agent ==`, "info");
  pushLine(state, `$ ops.plan --objective "remove workflow complexity"`, "cmd");
  tl(state, "p", "Ops agent started");
  await sleep(240);

  const ok = await gate({ action: "ops.workflow_plan", reason: "Generate rollout plan with operator control points." });
  if(!ok){
    pushLine(state, `[ops_agent] blocked by policy`, "warn");
    tl(state, "w", "Ops blocked");
    artifact(state,"Ops Plan","Blocked by operator policy gate.");
    return;
  }

  const steps = [
    "Inventory current tools + workflows",
    "Select 3 high-ROI automations",
    "Assign agent permissions + approval gates",
    "Run local-first pilot (7 days)",
    "Review audit + artifacts",
    "Scale to teams and departments"
  ];
  steps.forEach((s,i)=>pushLine(state, ` - [${i+1}] ${s}`, "info"));
  await sleep(180);
  artifact(state, "Ops Plan", `Rollout checklist created (${steps.length} steps).`);
  tl(state, "g", "Ops artifact created");
}

async function agentRnd(state, gate){
  if(!state.permissions.rnd){
    pushLine(state, `[rnd_agent] skipped (disabled)`, "warn");
    tl(state, "w", "R&D skipped");
    return;
  }
  pushLine(state, `== rnd_agent ==`, "info");
  pushLine(state, `$ rnd.experiment --name "agent-routing-accuracy" --A/B`, "cmd");
  tl(state, "p", "R&D agent started");
  await sleep(240);

  const ok = await gate({ action: "rnd.sandbox_test", reason: "Run sandbox experiment (simulation)." });
  if(!ok){
    pushLine(state, `[rnd_agent] blocked by policy`, "warn");
    tl(state, "w", "R&D blocked");
    artifact(state,"R&D Notes","Blocked by operator policy gate.");
    return;
  }

  const a = (85 + Math.random()*10).toFixed(1);
  const b = (83 + Math.random()*12).toFixed(1);
  pushLine(state, `[rnd] A=${a}% B=${b}% (demo)`, "info");
  await sleep(200);
  artifact(state, "R&D Notes", `Experiment logged. Recommendation: keep A; add richer task taxonomy + guardrails.`);
  tl(state, "g", "R&D artifact created");
}

function buildReport(state){
  const lines = [];
  lines.push("SCIOS — ORCHESTRATION RUN REPORT");
  lines.push("--------------------------------");
  lines.push(`run_id: ${state.runId}`);
  lines.push(`scenario: ${state.scenario}`);
  lines.push(`deployment: ${state.deployment}`);
  lines.push(`approvals: ${state.approvalsOn ? "on":"off"}`);
  lines.push("");
  lines.push("artifacts:");
  state.artifacts.forEach(a => lines.push(`- ${a.type}`));
  lines.push("");
  lines.push("executive_summary:");
  lines.push("- One command triggered multi-agent orchestration.");
  lines.push("- Policy gates enforced operator control.");
  lines.push("- Audit visibility produced credible console + timeline output.");
  lines.push("- Artifacts captured for verification and export.");
  return lines.join("\n");
}
