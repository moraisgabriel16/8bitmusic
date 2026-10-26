import {canConnect,ports} from './patches.js';

export const routeKey=(from,to)=>`${from}|${to}`;
export function connectionPair(a,b){
 const from=ports[a]?.direction==='out'?a:b,to=from===a?b:a;
 return canConnect(from,to)?[from,to]:null;
}
export function addConnection(routes,a,b){
 const pair=connectionPair(a,b);
 if(!pair)throw new Error('Conexão incompatível. Combine áudio com áudio ou CV com modulação.');
 // Inputs can sum multiple signals. Repeating a connection never removes it.
 return routes.some(r=>r[0]===pair[0]&&r[1]===pair[1])?routes.map(r=>[...r]):[...routes.map(r=>[...r]),pair];
}
export function copyBar(patch,bar){
 const start=bar*16;
 return {sequence:patch.sequence.slice(start,start+16),drums:patch.drums.map(row=>row.slice(start,start+16))};
}
export function pasteBar(patch,bar,clipboard){
 const next=structuredClone(patch),start=bar*16;
 next.sequence.splice(start,16,...clipboard.sequence);
 next.drums.forEach((row,i)=>row.splice(start,16,...clipboard.drums[i]));
 return next;
}
export function transformBar(patch,bar,action){
 const phrase=copyBar(patch,bar);
 if(action==='up'||action==='down')phrase.sequence=phrase.sequence.map(n=>n?Math.max(24,Math.min(84,n+(action==='up'?1:-1))):0);
 else if(action==='left'||action==='right'){
  const rotate=row=>action==='left'?[...row.slice(1),row[0]]:[row.at(-1),...row.slice(0,-1)];
  phrase.sequence=rotate(phrase.sequence);phrase.drums=phrase.drums.map(rotate);
 }else if(action==='clear'){phrase.sequence.fill(0);phrase.drums.forEach(row=>row.fill(0));}
 else throw new Error('Ação inválida.');
 return pasteBar(patch,bar,phrase);
}
export function createHistory(initial,limit=80){
 let current=structuredClone(initial),past=[],future=[],lastGroup,lastTime=0;
 return {
  record(next,group,now=Date.now()){
   if(JSON.stringify(next)===JSON.stringify(current))return;
   if(!group||group!==lastGroup||now-lastTime>650){past.push(current);if(past.length>limit)past.shift();}
   current=structuredClone(next);future=[];lastGroup=group;lastTime=now;
  },
  undo(){if(!past.length)return null;future.push(current);current=past.pop();lastGroup=null;return structuredClone(current);},
  redo(){if(!future.length)return null;past.push(current);current=future.pop();lastGroup=null;return structuredClone(current);},
  get canUndo(){return past.length>0;},get canRedo(){return future.length>0;}
 };
}
