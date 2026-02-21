export function pushLine(state, line){
  state.terminal.push(line);
  state.kpis.audit++;
}

export function terminalText(state){
  const max = 220;
  const slice = state.terminal.slice(-max);
  return slice.join("\n");
}

export function tl(state, dot, text){
  state.timeline.push({ dot, text, ts: new Date().toISOString() });
}
