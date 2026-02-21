const term=document.getElementById("terminal");
const runBtn=document.getElementById("runBtn");
const cmdInput=document.getElementById("cmdInput");
const cmdSend=document.getElementById("cmdSend");

const a1=document.getElementById("a1");
const a2=document.getElementById("a2");
const a3=document.getElementById("a3");
const a4=document.getElementById("a4");

const mAgents=document.getElementById("mAgents");
const mTasks=document.getElementById("mTasks");
const mArtifacts=document.getElementById("mArtifacts");

let tasks=0,artifacts=0;

function write(t){term.textContent+=t+"\n";term.scrollTop=term.scrollHeight}
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms))

runBtn.onclick=async()=>{
write("Booting SCIOS kernel…");await sleep(600);

a1.textContent="running";write("Security agent deployed");await sleep(600);
a2.textContent="running";write("Finance agent deployed");await sleep(600);
a3.textContent="running";write("Operations agent deployed");await sleep(600);
a4.textContent="running";write("R&D agent deployed");await sleep(600);

mAgents.textContent=4;

write("Executing orchestration…");await sleep(900);

tasks++;artifacts+=3;
mTasks.textContent=tasks;
mArtifacts.textContent=artifacts;

write("Generating artifacts…");await sleep(900);
write("Run complete.");
};

cmdSend.onclick=()=>{
const c=cmdInput.value.trim();
if(!c)return;
write("> "+c);
write("Task routed via orchestrator");
tasks++;
mTasks.textContent=tasks;
cmdInput.value="";
};
