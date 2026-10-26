import {Percussion} from './drums.js';
import {drumTracks} from './library.js';
import {stepDuration} from './patches.js';
const freq=n=>440*2**((n-69)/12);
const set=(param,value,t)=>param.setTargetAtTime(value,t,.012);

export class ModularSynth {
 constructor(ctx,patch){
  this.ctx=ctx;this.patch=patch;this.lastNote=41;this.cables=[];this.active=false;
  this.oscA=ctx.createOscillator();this.oscB=ctx.createOscillator();this.subOsc=ctx.createOscillator();this.subOsc.type='sine';
  this.lfo=ctx.createOscillator();this.envSource=ctx.createConstantSource();this.envSource.offset.value=1;this.envelope=ctx.createGain();this.envelope.gain.value=0;this.envSource.connect(this.envelope);
  this.mixA=ctx.createGain();this.mixB=ctx.createGain();this.subGain=ctx.createGain();this.noiseGain=ctx.createGain();this.mixer=ctx.createGain();
  this.mixA.connect(this.mixer);this.mixB.connect(this.mixer);this.subOsc.connect(this.subGain);this.subGain.connect(this.mixer);
  const buffer=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),data=buffer.getChannelData(0);let seed=98765;
  for(let i=0;i<data.length;i++){seed=(1664525*seed+1013904223)>>>0;data[i]=seed/2147483648-1;}
  this.noiseSource=ctx.createBufferSource();this.noiseSource.buffer=buffer;this.noiseSource.loop=true;this.noiseSource.connect(this.noiseGain);this.noiseGain.connect(this.mixer);
  this.filter=ctx.createBiquadFilter();this.vca=ctx.createGain();this.vca.gain.value=0;this.amp=ctx.createGain();this.vca.connect(this.amp);
  this.driveIn=ctx.createGain();this.driveDry=ctx.createGain();this.driveWet=ctx.createGain();this.shaper=ctx.createWaveShaper();this.shaper.oversample='2x';this.tone=ctx.createBiquadFilter();this.tone.type='lowpass';this.driveOut=ctx.createGain();
  this.driveIn.connect(this.driveDry);this.driveDry.connect(this.driveOut);this.driveIn.connect(this.shaper);this.shaper.connect(this.tone);this.tone.connect(this.driveWet);this.driveWet.connect(this.driveOut);
  this.delayIn=ctx.createGain();this.delay=ctx.createDelay(1);this.delayFeedback=ctx.createGain();this.delayDry=ctx.createGain();this.delayWet=ctx.createGain();this.delayOut=ctx.createGain();
  this.delayIn.connect(this.delayDry);this.delayDry.connect(this.delayOut);this.delayIn.connect(this.delay);this.delay.connect(this.delayFeedback);this.delayFeedback.connect(this.delay);this.delay.connect(this.delayWet);this.delayWet.connect(this.delayOut);
  this.outputIn=ctx.createGain();this.limiter=ctx.createDynamicsCompressor();this.limiter.threshold.value=-12;this.limiter.ratio.value=12;this.limiter.knee.value=12;this.limiter.attack.value=.003;this.limiter.release.value=.12;
  this.master=ctx.createGain();this.master.gain.value=0;this.analyser=ctx.createAnalyser();this.analyser.fftSize=2048;this.outputIn.connect(this.limiter);this.limiter.connect(this.master);this.master.connect(this.analyser);this.analyser.connect(ctx.destination);
  this.outputs={'oscA.out':this.oscA,'oscB.out':this.oscB,'mixer.out':this.mixer,'filter.out':this.filter,'drive.out':this.driveOut,'vca.out':this.amp,'delay.out':this.delayOut,'env.out':this.envelope,'lfo.out':this.lfo};
  this.inputs={'mixer.a':this.mixA,'mixer.b':this.mixB,'filter.in':this.filter,'drive.in':this.driveIn,'vca.in':this.vca,'delay.in':this.delayIn,'output.in':this.outputIn,'filter.cv':this.filter.frequency,'vca.cv':this.vca.gain,'oscA.cv':this.oscA.detune,'oscB.cv':this.oscB.detune};
  this.drums=new Percussion(ctx,this.outputIn,patch.kit);
  this.update();this.route();this.setPitch(41,ctx.currentTime,true);
  for(const node of [this.oscA,this.oscB,this.subOsc,this.lfo,this.envSource,this.noiseSource])node.start();
 }
 enable(){this.active=true;set(this.master.gain,this.patch.params.master/100*.7,this.ctx.currentTime);}
 setPitch(note,t,immediate=false){const p=this.patch.params,glide=immediate?0:p.glide;this.lastNote=note;
  for(const [osc,n]of [[this.oscA,note+p.tuneA],[this.oscB,note+p.tuneB],[this.subOsc,note-12]]){osc.frequency.cancelScheduledValues(t);if(glide>0)osc.frequency.setTargetAtTime(freq(n),t,Math.max(.001,glide/3));else osc.frequency.setValueAtTime(freq(n),t);}
 }
 update(key){const p=this.patch.params,t=this.ctx.currentTime;
  this.oscA.type=p.waveA;this.oscB.type=p.waveB;this.lfo.type=p.lfoWave;this.filter.type=p.filterType;
  for(const [param,value]of [[this.oscA.detune,p.detuneA],[this.oscB.detune,p.detuneB],[this.mixA.gain,p.mixA/100*.3],[this.mixB.gain,p.mixB/100*.3],[this.subGain.gain,p.sub/100*.3],[this.noiseGain.gain,p.noise/100*.12],[this.filter.frequency,p.cutoff],[this.filter.Q,p.resonance],[this.amp.gain,p.amp/100],[this.lfo.frequency,p.lfoRate],[this.tone.frequency,p.tone],[this.driveDry.gain,1-p.driveMix/100],[this.driveWet.gain,p.driveMix/100],[this.delay.delayTime,p.delayTime],[this.delayFeedback.gain,p.feedback/100],[this.delayDry.gain,1-p.delayMix/100*.5],[this.delayWet.gain,p.delayMix/100]])set(param,value,t);
  if(!key||key==='drive'){const curve=new Float32Array(2048),amount=1+p.drive/100*18;for(let i=0;i<curve.length;i++){const x=i*2/(curve.length-1)-1;curve[i]=Math.tanh(x*amount)/Math.tanh(amount)*.8;}this.shaper.curve=curve;}
  if(key==='tuneA'||key==='tuneB'||key==='glide')this.setPitch(this.lastNote,t);
  if(this.active)set(this.master.gain,p.master/100*.7,t);
  this.updateModulation();
 }
 updateModulation(){const p=this.patch.params;for(const cable of this.cables){if(!cable.scale)continue;let amount;if(cable.from==='env.out')amount=cable.to==='vca.cv'?1:p.envAmount/100*6000;else amount=cable.to==='filter.cv'?p.cutoff*.7*p.lfoDepth/100:150*p.lfoDepth/100;set(cable.scale.gain,amount,this.ctx.currentTime);}}
 route(){for(const c of this.cables){try{this.outputs[c.from].disconnect(c.scale||this.inputs[c.to]);}catch{}c.scale?.disconnect();}this.cables=[];
  for(const [from,to]of this.patch.routes){const source=this.outputs[from],target=this.inputs[to];if(!source||!target)continue;const c={from,to};if(to.endsWith('.cv')){c.scale=this.ctx.createGain();c.scale.gain.value=0;source.connect(c.scale);c.scale.connect(target);}else source.connect(target);this.cables.push(c);}this.updateModulation();
 }
 noteOn(note,t=this.ctx.currentTime,gateSeconds){const p=this.patch.params,g=this.envelope.gain;this.setPitch(note,t);g.cancelScheduledValues(t);g.setValueAtTime(.0001,t);g.linearRampToValueAtTime(1,t+p.attack);g.exponentialRampToValueAtTime(Math.max(.0001,p.sustain/100),t+p.attack+p.decay);
  if(gateSeconds!==undefined){const off=t+gateSeconds;let level;if(gateSeconds<p.attack)level=gateSeconds/p.attack;else if(gateSeconds<p.attack+p.decay)level=Math.pow(Math.max(.0001,p.sustain/100),(gateSeconds-p.attack)/p.decay);else level=p.sustain/100;g.cancelScheduledValues(off);if(gateSeconds<p.attack)g.linearRampToValueAtTime(Math.max(.0001,level),off);else if(gateSeconds<p.attack+p.decay)g.exponentialRampToValueAtTime(Math.max(.0001,level),off);else g.setValueAtTime(Math.max(.0001,level),off);g.exponentialRampToValueAtTime(.0001,off+p.release);}
 }
 noteOff(){const g=this.envelope.gain,t=this.ctx.currentTime;if(g.cancelAndHoldAtTime)g.cancelAndHoldAtTime(t);else{g.cancelScheduledValues(t);g.setValueAtTime(Math.max(.0001,g.value),t);}g.setTargetAtTime(0,t,Math.max(.006,this.patch.params.release/3));}
 step(index,t){const note=this.patch.sequence[index],duration=stepDuration(this.patch,index);if(note)this.noteOn(note,t,duration*this.patch.gate/100);if(this.patch.rhythm){drumTracks.forEach((id,i)=>{if(this.patch.drums[i][index])this.drums.trigger(id,this.patch.drums[i][index],t);});}}
 panic(){this.active=false;const t=this.ctx.currentTime;this.envelope.gain.cancelScheduledValues(t);this.envelope.gain.setValueAtTime(0,t);this.master.gain.cancelScheduledValues(t);this.master.gain.setTargetAtTime(0,t,.008);this.drums.silence();}
 dispose(){this.panic();this.drums.dispose();for(const n of [this.oscA,this.oscB,this.subOsc,this.lfo,this.envSource,this.noiseSource]){try{n.stop();}catch{}}for(const c of this.cables)c.scale?.disconnect();for(const n of [this.oscA,this.oscB,this.subOsc,this.lfo,this.envSource,this.noiseSource,this.envelope,this.mixA,this.mixB,this.subGain,this.noiseGain,this.mixer,this.filter,this.vca,this.amp,this.driveIn,this.driveDry,this.driveWet,this.shaper,this.tone,this.driveOut,this.delayIn,this.delay,this.delayFeedback,this.delayDry,this.delayWet,this.delayOut,this.outputIn,this.limiter,this.master,this.analyser])n.disconnect();}
}
export async function exportWav(patch){const rate=44100,seconds=60/patch.bpm*16+Math.max(3,patch.params.release+1),ctx=new OfflineAudioContext(2,Math.ceil(seconds*rate),rate),engine=new ModularSynth(ctx,patch);engine.enable();let time=.05;for(let i=0;i<64;i++){engine.step(i,time);time+=stepDuration(patch,i);}const b=await ctx.startRendering(),bytes=new ArrayBuffer(44+b.length*4),v=new DataView(bytes);const str=(o,s)=>[...s].forEach((c,i)=>v.setUint8(o+i,c.charCodeAt(0)));str(0,'RIFF');v.setUint32(4,bytes.byteLength-8,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,2,true);v.setUint32(24,rate,true);v.setUint32(28,rate*4,true);v.setUint16(32,4,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,b.length*4,true);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<b.length;i++)v.setInt16(44+i*4+ch*2,Math.round(Math.max(-1,Math.min(1,d[i]))*32767),true);}engine.dispose();return new Blob([bytes],{type:'audio/wav'});}
