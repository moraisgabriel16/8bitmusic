import {allPresets,getPreset,arrangePreset} from './library.js';
export const defaults = {
  waveA:'sawtooth', waveB:'sawtooth', tuneA:0, tuneB:0, detuneA:-7, detuneB:7,
  mixA:70, mixB:48, sub:22, noise:0, cutoff:1600, resonance:2.8, filterType:'lowpass',
  attack:.008, decay:.23, sustain:36, release:.18, envAmount:38,
  lfoRate:1.8, lfoDepth:18, lfoWave:'sine', drive:20, driveMix:35, tone:6500,
  amp:70, glide:.025, delayTime:.28, feedback:28, delayMix:22, master:55
};

export const ports = {
 'oscA.out':{label:'OSC A · OUT',direction:'out',type:'audio',rank:0,color:'#ec9c66'},
 'oscB.out':{label:'OSC B · OUT',direction:'out',type:'audio',rank:0,color:'#ddb56a'},
 'mixer.a':{label:'MIXER · IN A',direction:'in',type:'audio',rank:1},
 'mixer.b':{label:'MIXER · IN B',direction:'in',type:'audio',rank:1},
 'mixer.out':{label:'MIXER · OUT',direction:'out',type:'audio',rank:1,color:'#e4c46a'},
 'filter.in':{label:'FILTER · IN',direction:'in',type:'audio',rank:2},
 'filter.cv':{label:'FILTER · CUTOFF CV',direction:'in',type:'cv'},
 'filter.out':{label:'FILTER · OUT',direction:'out',type:'audio',rank:2,color:'#c1d882'},
 'drive.in':{label:'DRIVE · IN',direction:'in',type:'audio',rank:3},
 'drive.out':{label:'DRIVE · OUT',direction:'out',type:'audio',rank:3,color:'#e98b77'},
 'vca.in':{label:'VCA · IN',direction:'in',type:'audio',rank:4},
 'vca.cv':{label:'VCA · GATE CV',direction:'in',type:'cv'},
 'vca.out':{label:'VCA · OUT',direction:'out',type:'audio',rank:4,color:'#7fc8bc'},
 'delay.in':{label:'DELAY · IN',direction:'in',type:'audio',rank:5},
 'delay.out':{label:'DELAY · OUT',direction:'out',type:'audio',rank:5,color:'#9eb2e9'},
 'output.in':{label:'OUTPUT · IN',direction:'in',type:'audio',rank:6},
 'env.out':{label:'ENVELOPE · CV OUT',direction:'out',type:'cv',color:'#bca1df'},
 'lfo.out':{label:'LFO · CV OUT',direction:'out',type:'cv',color:'#79c5d3'},
 'oscA.cv':{label:'OSC A · PITCH CV',direction:'in',type:'cv'},
 'oscB.cv':{label:'OSC B · PITCH CV',direction:'in',type:'cv'}
};
export const defaultRoutes = [
 ['oscA.out','mixer.a'],['oscB.out','mixer.b'],['mixer.out','filter.in'],
 ['filter.out','drive.in'],['drive.out','vca.in'],['vca.out','delay.in'],
 ['delay.out','output.in'],['env.out','vca.cv'],['env.out','filter.cv'],['lfo.out','filter.cv']
];
export const presets = {
 house:{name:'Velvet circuitry',tag:'WARM / HOUSE',bpm:128,description:'Ataque macio, pulso quente. Abra o filtro e encontre o groove.',
   params:{waveA:'triangle',waveB:'sawtooth',mixB:30,cutoff:1900,resonance:1.3,attack:.012,decay:.2,sustain:24,release:.18,drive:12,envAmount:22,lfoDepth:8},
   notes:[41,0,0,48,0,44,0,0,41,0,51,0,48,0,44,0],
   drums:['1000100010001000','0000100000001000','1010101010101010','0010001000100010']},
 techno:{name:'Acid machinery',tag:'ACID / TECHNO',bpm:132,description:'Ressonância alta, envelope curto. Uma máquina em movimento.',
   params:{waveA:'sawtooth',waveB:'square',mixB:20,cutoff:550,resonance:10,attack:.003,decay:.17,sustain:10,release:.09,envAmount:65,drive:48,driveMix:55,lfoRate:.35,lfoDepth:12,glide:.04,delayMix:18},
   notes:[41,0,41,48,0,41,51,0,41,44,0,48,53,0,41,48],
   drums:['1000100010001000','0000100000001000','1011101010111010','0010001000100010']},
 trance:{name:'Orbital transmission',tag:'ARPEGGIO / TRANCE',bpm:138,description:'Osciladores desafinados, arpejo aberto e ecos no espaço.',
   params:{waveA:'sawtooth',waveB:'sawtooth',detuneA:-14,detuneB:14,mixB:65,sub:10,cutoff:3200,resonance:1.8,attack:.01,decay:.28,sustain:42,release:.35,envAmount:18,drive:10,delayMix:38,feedback:42,lfoRate:.22,lfoDepth:14},
   notes:[53,60,56,60,53,60,65,60,56,63,60,63,56,63,68,63],
   drums:['1000100010001000','0000100000001000','1010101010101010','0010001000100010']},
 dnb:{name:'Sub pressure',tag:'REESE / DRUM & BASS',bpm:174,description:'Duas serras, subgrave e movimento lento no filtro.',
   params:{waveA:'sawtooth',waveB:'sawtooth',detuneA:-22,detuneB:22,mixB:70,sub:50,cutoff:700,resonance:3,attack:.006,decay:.2,sustain:78,release:.16,lfoRate:.65,lfoDepth:60,envAmount:12,drive:55,driveMix:60,delayMix:10,glide:.065},
   notes:[29,0,0,0,0,0,29,0,36,0,0,0,0,32,0,0],
   drums:['1000001000100000','0000100000001000','1011101010111011','0000000100000010']},
 funk:{name:'Baile elétrico',tag:'808 / FUNK BRASILEIRO',bpm:130,description:'Subgrave profundo e percussão inspirada no tamborzão.',
   params:{waveA:'sine',waveB:'triangle',mixA:80,mixB:32,sub:35,detuneA:0,detuneB:0,cutoff:900,resonance:.8,attack:.003,decay:.26,sustain:20,release:.13,envAmount:5,lfoDepth:0,drive:25,driveMix:28,delayMix:8,glide:.035},
   notes:[29,0,0,0,0,0,29,0,0,0,36,0,0,0,32,0],
   drums:['1000001000100000','0000100000001000','1010101110101011','0001000100010010']}
};

export const controls = {
 tuneA:{label:'TUNE',min:-24,max:24,step:1,unit:'st'},detuneA:{label:'FINE',min:-50,max:50,step:1,unit:'ct'},
 tuneB:{label:'TUNE',min:-24,max:24,step:1,unit:'st'},detuneB:{label:'FINE',min:-50,max:50,step:1,unit:'ct'},
 mixA:{label:'OSC A',min:0,max:100,step:1,unit:'%'},mixB:{label:'OSC B',min:0,max:100,step:1,unit:'%'},
 sub:{label:'SUB',min:0,max:100,step:1,unit:'%'},noise:{label:'NOISE',min:0,max:100,step:1,unit:'%'},
 cutoff:{label:'CUTOFF',min:40,max:16000,step:1,unit:'Hz',log:true},resonance:{label:'RESONANCE',min:.1,max:16,step:.1,unit:'Q'},
 envAmount:{label:'ENV AMT',min:0,max:100,step:1,unit:'%'},
 attack:{label:'ATTACK',min:.003,max:2,step:.001,unit:'s',log:true},decay:{label:'DECAY',min:.03,max:2,step:.001,unit:'s',log:true},
 sustain:{label:'SUSTAIN',min:0,max:100,step:1,unit:'%'},release:{label:'RELEASE',min:.02,max:3,step:.001,unit:'s',log:true},
 lfoRate:{label:'RATE',min:.05,max:20,step:.01,unit:'Hz',log:true},lfoDepth:{label:'DEPTH',min:0,max:100,step:1,unit:'%'},
 drive:{label:'DRIVE',min:0,max:100,step:1,unit:'%'},driveMix:{label:'BLEND',min:0,max:100,step:1,unit:'%'},tone:{label:'TONE',min:300,max:12000,step:1,unit:'Hz',log:true},
 amp:{label:'LEVEL',min:0,max:100,step:1,unit:'%'},glide:{label:'GLIDE',min:0,max:.5,step:.001,unit:'s'},
 delayTime:{label:'TIME',min:.03,max:.8,step:.001,unit:'s'},feedback:{label:'FEEDBACK',min:0,max:75,step:1,unit:'%'},delayMix:{label:'MIX',min:0,max:75,step:1,unit:'%'},
 master:{label:'MASTER',min:0,max:90,step:1,unit:'%'}
};
export function createPatch(genre='techno',master=55,presetId){
 if(!Object.hasOwn(presets,genre))throw new Error('Estilo inválido.');
 const p=presetId?getPreset(presetId):allPresets.find(p=>p.genre===genre);
 if(!p||p.genre!==genre)throw new Error('Preset inválido.');
 return {version:3,muted:Array(8).fill(false),bypass:{},modAmounts:{},genre,presetId:p.id,kit:p.kit,swing:p.swing,name:p.name,bpm:p.bpm,params:{...defaults,...presets[genre].params,...p.params,master},routes:defaultRoutes.map(r=>[...r]),...arrangePreset(p),rhythm:true,gate:p.gate};
}
export const stepDuration=(p,i)=>60/p.bpm/4*(1+(i%2?-1:1)*(p.swing||0)/100);
export function migratePatch(p){
 if(p?.version===3)return validatePatch(p)?p:null;
 if(!validatePatch(p))return null;
 const next=createPatch(p.genre,p.params.master);
 return {...next,...p,version:3,sequence:Array.from({length:64},(_,i)=>p.sequence[i%16]),drums:Array.from({length:8},(_,r)=>Array.from({length:64},(_,i)=>r<4?p.drums[r][i%16]:0))};
}
export function canConnect(from,to){const a=ports[from],b=ports[to];return !!(a&&b&&a.direction==='out'&&b.direction==='in'&&a.type===b.type&&(a.type==='cv'?(from==='env.out'?['vca.cv','filter.cv'].includes(to):to!=='vca.cv'):a.rank<b.rank));}
export function validatePatch(s){
 if(!s||![2,3].includes(s.version)||!Object.hasOwn(presets,s.genre)||!s.params||typeof s.name!=='string'||s.name.length>100||typeof s.rhythm!=='boolean'||!Number.isFinite(s.bpm)||s.bpm<60||s.bpm>200||!Number.isFinite(s.gate)||s.gate<10||s.gate>100)return false;
 if(!Object.entries(controls).every(([key,c])=>Number.isFinite(s.params[key])&&s.params[key]>=c.min&&s.params[key]<=c.max))return false;
 if(!['waveA','waveB','lfoWave'].every(k=>['sine','triangle','sawtooth','square'].includes(s.params[k]))||!['lowpass','highpass','bandpass'].includes(s.params.filterType))return false;
 if(!Array.isArray(s.sequence)||s.sequence.length!==(s.version===3?64:16)||!s.sequence.every(n=>Number.isInteger(n)&&(n===0||(n>=24&&n<=84))))return false;
 if(!Array.isArray(s.drums)||s.drums.length!==(s.version===3?8:4)||!s.drums.every(row=>Array.isArray(row)&&row.length===(s.version===3?64:16)&&row.every(n=>Number.isFinite(n)&&n>=0&&n<=1)))return false;
 if(s.version===3&&(!getPreset(s.presetId)||getPreset(s.presetId).genre!==s.genre||!allPresets.some(p=>p.kit===s.kit)||!Number.isFinite(s.swing)||s.swing<0||s.swing>30))return false;
 if(s.muted!==undefined&&(!Array.isArray(s.muted)||s.muted.length!==8||!s.muted.every(v=>typeof v==='boolean')))return false;
 if(s.bypass!==undefined&&(!s.bypass||Array.isArray(s.bypass)||typeof s.bypass!=='object'||!Object.entries(s.bypass).every(([k,v])=>['filter','drive','delay'].includes(k)&&typeof v==='boolean')))return false;
 if(s.modAmounts!==undefined&&(!s.modAmounts||Array.isArray(s.modAmounts)||typeof s.modAmounts!=='object'||!Object.entries(s.modAmounts).every(([k,v])=>Number.isFinite(v)&&v>=-100&&v<=100&&Array.isArray(s.routes)&&s.routes.some(r=>Array.isArray(r)&&r.join('|')===k&&ports[r[0]]?.type==='cv'))))return false;
 if(!Array.isArray(s.routes)||s.routes.length>64||!s.routes.every(r=>Array.isArray(r)&&r.length===2&&canConnect(...r)))return false;
 return new Set(s.routes.map(r=>r.join('|'))).size===s.routes.length;
}
export const noteName=n=>n===0?'—':['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'][n%12]+(Math.floor(n/12)-1);
