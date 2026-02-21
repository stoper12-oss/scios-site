export function createState(){
  return {
    runId: null,
    mode: "idle",
    deployment: "local-first",
    approvalsOn: true,
    focusAgent: "security",
    permissions: { security:true, finance:true, ops:true, rnd:true },
    kpis: { prompts:0, artifacts:0, audit:0 },
    memory: {},
    timeline: [],
    terminal: [],
    artifacts: [],
    telemetry: { t:0, cpu:12, mem:28, net:6 }
  };
}

export function newRunId(){
  const a = Math.random().toString(16).slice(2);
  const b = Math.random().toString(16).slice(2);
  return (a+b).slice(0,16);
}
