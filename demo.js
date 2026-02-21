const term = document.getElementById("terminal");
const runBtn = document.getElementById("runBtn");
const cmdInput = document.getElementById("cmdInput");
const cmdSend = document.getElementById("cmdSend");

const a1=document.getElementById("a1");
const a2=document.getElementById("a2");
const a3=document.getElementById("a3");
const a4=document.getElementById("a4");

function write(t){term.textContent+=t+"\n";term.scrollTop=term.scrollHeight}
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}

runBtn.onclick=async()=>{
write("Booting SCIOS…");
await sleep(500);

a1.textContent="running";write("Security agent deployed");
await sleep(600);

a2.textContent="running";write("Finance agent deployed");
await sleep(600);

a3.textContent="running";write("Operations agent deployed");
await sleep(600);

a4.textContent="running";write("R&D agent deployed");
await sleep(600);

write("Generating report…");
await sleep(800);

write("Run complete.");
};

cmdSend.onclick=()=>{
const c=cmdInput.value.trim();
if(!c)return;
write("> "+c);
write("Task routed to agents");
cmdInput.value="";
};
