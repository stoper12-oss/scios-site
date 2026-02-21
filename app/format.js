function esc(s){
  return (s||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}

export function terminalHTML(state){
  const max = 220;
  const slice = state.terminal.slice(-max);
  if(!slice.length) return `Type Ctrl/⌘ K for command palette.`;

  return slice.map(x=>{
    const cls =
      x.level==="ok" ? "ok" :
      x.level==="warn" ? "warn" :
      x.level==="bad" ? "bad" :
      x.level==="cmd" ? "cmd" : "info";

    const ts = esc(x.ts.split("T")[1].replace("Z",""));
    return `<span class="ts">[${ts}]</span> <span class="${cls}">${esc(x.line)}</span>`;
  }).join("\n");
}
