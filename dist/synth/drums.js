// Original synthesized one-shots: membrane modes, pitched transients and noise.
export function renderDrumSample(voice,kit,rate=44100){
 const funk=['tamborzao','funk150','beatbox','mandelao'].includes(kit);
 const hard=['industrial','neuro','mandelao','jumpup'].includes(kit);
 const organic=['afro','tamborzao','funk150','liquid','jungle'].includes(kit);
 const hash=[...kit].reduce((a,c)=>a+c.charCodeAt(0),0),tune=.94+(hash%17)/100;
 const duration=voice==='open'?.48:voice==='kick'?.55:.32;
 const data=new Float32Array(Math.ceil(rate*duration));let seed=hash+17,low=0,phase=0;
 for(let i=0;i<data.length;i++){
  const t=i/rate;seed=(1664525*seed+1013904223)>>>0;const noise=seed/2147483648-1;low+=.17*(noise-low);const high=noise-low;let v=0;
  if(voice==='kick'){const f=(funk?58:48)*tune+130*Math.exp(-t*65);phase+=2*Math.PI*f/rate;v=Math.sin(phase)*Math.exp(-t*(kit==='mandelao'?8:12))+high*.15*Math.exp(-t*200);if(organic)v+=.12*Math.sin(2*Math.PI*112*t)*Math.exp(-t*25);}
  else if(voice==='snare'){v=(Math.sin(2*Math.PI*185*t*tune)*.4*Math.exp(-t*28)+high*.85*Math.exp(-t*(kit==='jungle'?20:30)));if(kit==='beatbox')v+=(Math.sin(2*Math.PI*780*t)+Math.sin(2*Math.PI*1250*t))*.22*Math.exp(-t*45);}
  else if(voice==='hat'||voice==='open'){v=(high*.6+Math.sin(2*Math.PI*6131*t)*Math.sin(2*Math.PI*4217*t)*.15)*Math.exp(-t*(voice==='hat'?95:13));}
  else {const f=({tomLow:115,tomHigh:175,conga:235,slap:390}[voice]||180)*tune;const decay=voice==='slap'?40:voice==='conga'?22:18;phase+=2*Math.PI*(f+f*.6*Math.exp(-t*100))/rate;v=(Math.sin(phase)+.37*Math.sin(phase*1.59)+.19*Math.sin(phase*2.17))*Math.exp(-t*decay)*.65+high*(voice==='slap'?.65:.14)*Math.exp(-t*85);if(kit==='mandelao')v+=Math.sin(phase*3.73)*.35*Math.exp(-t*20);}
  if(hard)v=Math.tanh(v*2.5)*.8;
  data[i]=v*Math.min(1,t*2000)*Math.min(1,(duration-t)*100)*.65;
 }
 return data;
}
export class Percussion {
 constructor(ctx,output,kit){this.ctx=ctx;this.output=output;this.kit=kit;this.buffers=new Map();this.sources=new Set();}
 trigger(voice,velocity,t){let buffer=this.buffers.get(voice);if(!buffer){const data=renderDrumSample(voice,this.kit,this.ctx.sampleRate);buffer=this.ctx.createBuffer(1,data.length,this.ctx.sampleRate);buffer.copyToChannel(data,0);this.buffers.set(voice,buffer);}const source=this.ctx.createBufferSource(),gain=this.ctx.createGain();source.buffer=buffer;gain.gain.value=velocity;source.connect(gain);gain.connect(this.output);this.sources.add(source);source.onended=()=>{source.disconnect();gain.disconnect();this.sources.delete(source);};source.start(t);}
 silence(){for(const source of this.sources){try{source.stop();}catch{}}this.sources.clear();}
 dispose(){this.silence();this.buffers.clear();}
}
