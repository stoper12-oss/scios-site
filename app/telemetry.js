export function tickTelemetry(state){
  const t = state.telemetry;
  t.t += 1;
  const jig = (m)=> (Math.random()*m - m/2);

  t.cpu = clamp(t.cpu + jig(3) + (state.mode==="running"? 1.2: -0.6), 6, 92);
  t.mem = clamp(t.mem + jig(1.6) + (state.mode==="running"? 0.6: -0.2), 10, 86);
  t.net = clamp(t.net + jig(1.4) + (state.mode==="running"? 0.8: -0.5), 0.2, 55);
}
function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }

export function drawTelemetry(canvas, history){
  const ctx = canvas.getContext("2d");
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0,0,w,h);

  ctx.strokeStyle = "rgba(255,255,255,.12)";
  for(let i=1;i<6;i++){
    const y = (h/6)*i;
    ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke();
  }

  const drawLine = (arr, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for(let i=0;i<arr.length;i++){
      const x = (w*(i/(arr.length-1)));
      const y = h - (h*(arr[i]/100));
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke();
  };

  const cpu = history.map(x=>x.cpu);
  const mem = history.map(x=>x.mem);
  const net = history.map(x=> (x.net/55)*100);

  drawLine(cpu, "rgba(107,228,255,.95)");
  drawLine(mem, "rgba(167,139,250,.92)");
  drawLine(net, "rgba(52,211,153,.92)");

  ctx.fillStyle = "rgba(230,237,243,.85)";
  ctx.font = "12px ui-monospace, Menlo, Consolas, monospace";
  ctx.fillText("CPU", 14, 18);
  ctx.fillText("MEM", 64, 18);
  ctx.fillText("NET", 120, 18);
}
