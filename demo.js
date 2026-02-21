const term = document.getElementById("terminal");
const runBtn = document.getElementById("runBtn");
const resetBtn = document.getElementById("resetBtn");
const downloadBtn = document.getElementById("downloadBtn");

const cmdInput = document.getElementById("cmdInput");
const cmdSend = document.getElementById("cmdSend");

let log = [];

function write(line){
term.textContent += line + "\n";
log.push(line);
}

runBtn.onclick = async ()=>{
write("Booting SCIOS...");
await sleep(500);

write("Loading agents...");
await sleep(500);

write("Security agent running");
await sleep(500);

write("Finance agent running");
await sleep(500);

write("Operations agent running");
await sleep(500);

write("R&D agent running");
await sleep(500);

write("Run complete.");
};

cmdSend.onclick = ()=>{
const cmd = cmdInput.value.trim();
if(!cmd) return;
write("> " + cmd);
write("Executing task with agents...");
cmdInput.value="";
};

resetBtn.onclick = ()=>{
term.textContent="";
log=[];
};

downloadBtn.onclick = ()=>{
const blob = new Blob([log.join("\n")]);
const a = document.createElement("a");
a.href = URL.createObjectURL(blob);
a.download="run_log.txt";
a.click();
};

function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
