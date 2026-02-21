export function pushLine(state, line, level="info"){
  state.terminal.push({ ts: new Date().toISOString(), level, line });
  state.kpis.audit++;
}

export function tl(state, dot, text){
  state.timeline.push({ dot, text, ts: new Date().toISOString() });
}
