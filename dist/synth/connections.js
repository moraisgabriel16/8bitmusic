import {ports,canConnect} from './patches.js';
import {addConnection,connectionPair,routeKey} from './editing.js';

export function setupConnections({getPatch,change,notify}){
 const $=s=>document.querySelector(s),rack=$('#rack'),svg=$('#cables');
 let pending=null,selected=null,drag=null,suppressUntil=0;
 const options=(select,ids,placeholder)=>{
  select.replaceChildren(new Option(placeholder,''));
  for(const id of ids)select.add(new Option(ports[id].label,id));
 };
 options($('#route-from'),Object.keys(ports).filter(id=>ports[id].direction==='out'),'Escolha a saída');
 function destinations(){const from=$('#route-from').value,old=$('#route-to').value;
  options($('#route-to'),Object.keys(ports).filter(id=>ports[id].direction==='in'&&(!from||canConnect(from,id))),'Escolha a entrada');
  if([...$('#route-to').options].some(o=>o.value===old))$('#route-to').value=old;
  $('#route-connect').disabled=!$('#route-from').value||!$('#route-to').value;
 }
 const status=text=>{$('#connection-status').textContent=text;$('#patch-instruction').textContent=text;$('#mobile-connection-status').textContent=text;};
 function paintSelection(){for(const jack of rack.querySelectorAll('.jack')){const id=jack.dataset.port;jack.classList.toggle('pending',id===pending);jack.classList.toggle('compatible',!!pending&&!!connectionPair(pending,id));jack.classList.toggle('incompatible',!!pending&&id!==pending&&!connectionPair(pending,id));}$('#cancel-connection').disabled=!pending;}
 function cancel(){pending=null;drag=null;$('#connection-ghost')?.remove();paintSelection();status('Toque em duas portas compatíveis ou escolha saída e entrada acima.');}
 function choose(id){
  if(pending===id){cancel();return;}
  if(pending){const pair=connectionPair(pending,id);if(pair){connect(...pair);return;}if(ports[pending].direction!==ports[id].direction){notify('Portas incompatíveis: as iluminadas aceitam esta conexão.');return;}}
  pending=id;paintSelection();
  if(ports[id].direction==='out'){$('#route-from').value=id;destinations();$('#route-to').value='';}
  else{$('#route-from').value='';destinations();$('#route-to').value=id;}
  $('#route-connect').disabled=true;
  const count=getPatch().routes.filter(r=>r.includes(id)).length;
  status(ports[id].label+' · escolha uma porta iluminada. '+(count===1?'Uma conexão preservada.':count?count+' conexões preservadas.':''));
 }
 function connect(a,b){const pair=connectionPair(a,b);if(!pair){notify('Conexão incompatível.');return;}const patch=getPatch(),exists=patch.routes.some(r=>r[0]===pair[0]&&r[1]===pair[1]);
  if(!exists)change(p=>{p.routes=addConnection(p.routes,...pair);});
  selected=routeKey(...pair);cancel();$('#route-from').value=pair[0];destinations();$('#route-to').value=pair[1];$('#route-connect').disabled=false;refresh();status((exists?'Conexão já existente: ':'Conectado: ')+ports[pair[0]].label+' → '+ports[pair[1]].label);
 }
 function remove(from,to){change(p=>{p.routes=p.routes.filter(r=>r[0]!==from||r[1]!==to);if(p.modAmounts)delete p.modAmounts[routeKey(from,to)];});if(selected===routeKey(from,to))selected=null;refresh();status('Cabo removido. Use Desfazer para recuperar.');}
 function draw(){const bounds=rack.getBoundingClientRect();svg.setAttribute('viewBox',`0 0 ${bounds.width} ${bounds.height}`);svg.replaceChildren();for(const j of rack.querySelectorAll('.jack')){j.classList.remove('connected');j.removeAttribute('aria-pressed');}
  for(const [from,to]of getPatch().routes){const a=rack.querySelector(`[data-port="${from}"]`),b=rack.querySelector(`[data-port="${to}"]`);if(!a||!b)continue;const ar=a.getBoundingClientRect(),br=b.getBoundingClientRect(),x1=ar.left-bounds.left+ar.width/2,y1=ar.top-bounds.top+ar.height/2,x2=br.left-bounds.left+br.width/2,y2=br.top-bounds.top+br.height/2,sag=Math.min(80,Math.abs(x2-x1)*.12+23),path=document.createElementNS('http://www.w3.org/2000/svg','path');
   path.setAttribute('d',`M ${x1} ${y1} C ${x1} ${y1+sag}, ${x2} ${y2+sag}, ${x2} ${y2}`);path.setAttribute('stroke',ports[from].color);path.setAttribute('class','wire '+(ports[from].type==='cv'?'cv ':'')+(selected===routeKey(from,to)?'selected':''));svg.append(path);
   for(const j of [a,b]){j.classList.add('connected');j.style.setProperty('--jack-color',ports[from].color);}
  }$('#cable-count').textContent=getPatch().routes.length;paintSelection();
 }
 function refresh(){const patch=getPatch(),host=$('#route-list');host.replaceChildren();$('#route-total').textContent=patch.routes.length+' conexões';
  if(!patch.routes.length){const p=document.createElement('p');p.textContent='Sem cabos. Conecte uma fonte à saída ou restaure as rotas.';host.append(p);}
  for(const [from,to]of patch.routes){const key=routeKey(from,to),row=document.createElement('div');row.className='route-item'+(selected===key?' selected':'');const pick=document.createElement('button');pick.className='route-select';pick.textContent=ports[from].label+' → '+ports[to].label;pick.setAttribute('aria-label','Inspecionar '+pick.textContent);pick.onclick=()=>{selected=selected===key?null:key;refresh();};row.append(pick);
   if(ports[from].type==='cv'){const label=document.createElement('label');label.textContent='CV ';const input=document.createElement('input');input.type='range';input.min=-100;input.max=100;input.step=1;input.value=patch.modAmounts?.[key]??100;input.setAttribute('aria-label','Intensidade '+ports[from].label+' para '+ports[to].label);const output=document.createElement('output');output.textContent=input.value+'%';input.oninput=()=>{change(p=>{p.modAmounts??={};p.modAmounts[key]=Number(input.value);},'cv:'+key,false);output.textContent=input.value+'%';};label.append(input,output);row.append(label);}
   const button=document.createElement('button');button.className='route-remove';button.textContent='×';button.setAttribute('aria-label','Remover '+ports[from].label+' para '+ports[to].label);button.onclick=()=>remove(from,to);row.append(button);host.append(row);
  }draw();
 }
 for(const jack of rack.querySelectorAll('.jack')){
  jack.onclick=()=>{if(performance.now()<suppressUntil)return;choose(jack.dataset.port);};
  jack.onpointerdown=e=>{if(e.button!==0)return;drag={id:jack.dataset.port,pointerId:e.pointerId,x:e.clientX,y:e.clientY,moved:false};jack.setPointerCapture(e.pointerId);};
  jack.onpointermove=e=>{if(!drag||drag.pointerId!==e.pointerId)return;if(!drag.moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<7)return;drag.moved=true;pending=drag.id;paintSelection();const bounds=rack.getBoundingClientRect(),origin=jack.getBoundingClientRect();let ghost=$('#connection-ghost');if(!ghost){ghost=document.createElementNS('http://www.w3.org/2000/svg','path');ghost.id='connection-ghost';ghost.setAttribute('class','connection-ghost');svg.append(ghost);}ghost.setAttribute('d',`M ${origin.left-bounds.left+origin.width/2} ${origin.top-bounds.top+origin.height/2} Q ${e.clientX-bounds.left} ${origin.bottom-bounds.top+60} ${e.clientX-bounds.left} ${e.clientY-bounds.top}`);};
  jack.onpointerup=e=>{if(!drag||drag.pointerId!==e.pointerId)return;const gesture=drag;drag=null;$('#connection-ghost')?.remove();if(!gesture.moved)return;suppressUntil=performance.now()+500;const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('.jack');if(target&&connectionPair(gesture.id,target.dataset.port))connect(gesture.id,target.dataset.port);else{chooseAfterDrag(gesture.id);status('Solte numa porta iluminada ou toque no destino para concluir.');}};
  jack.onpointercancel=()=>{suppressUntil=performance.now()+500;cancel();};jack.onlostpointercapture=e=>{if(drag?.pointerId===e.pointerId)cancel();};
 }
 function chooseAfterDrag(id){pending=null;choose(id);}
 $('#route-from').onchange=()=>{pending=$('#route-from').value||null;destinations();paintSelection();};
 $('#route-to').onchange=()=>{$('#route-connect').disabled=!$('#route-from').value||!$('#route-to').value;};
 $('#route-connect').onclick=()=>connect($('#route-from').value,$('#route-to').value);
 $('#cancel-connection').onclick=cancel;
 $('#toggle-cables').onclick=()=>{const visible=$('#toggle-cables').getAttribute('aria-pressed')!=='true';$('#toggle-cables').setAttribute('aria-pressed',visible);svg.classList.toggle('hidden',!visible);};
 new ResizeObserver(()=>requestAnimationFrame(draw)).observe(rack);
 destinations();refresh();cancel();
 return {refresh,draw,cancel,get pending(){return pending;}};
}
