import test from 'node:test';
import assert from 'node:assert/strict';
import {allPresets,presetLibrary,drumTracks} from '../dist/synth/library.js';
import {createPatch,validatePatch,migratePatch,stepDuration} from '../dist/synth/patches.js';
import {renderDrumSample} from '../dist/synth/drums.js';
test('25 complete presets have unique rhythms and four bars with fills',()=>{
 assert.equal(allPresets.length,25);
 for(const items of Object.values(presetLibrary))assert.equal(items.length,5);
 const rhythms=[];
 for(const p of allPresets){const patch=createPatch(p.genre,40,p.id);assert.ok(validatePatch(patch),p.id);assert.equal(patch.sequence.length,64);assert.equal(patch.drums.length,8);assert.ok(patch.drums.some(row=>row.slice(0,16).join()!==row.slice(48).join()),p.id);rhythms.push(JSON.stringify(patch.drums));let total=0;for(let i=0;i<64;i++)total+=stepDuration(patch,i);assert.ok(Math.abs(total-960/p.bpm)<1e-9);}
 assert.equal(new Set(rhythms).size,25);
});
test('v2 migration preserves custom notes, routing and synthesis',()=>{
 const current=createPatch('funk');const old={...current,version:2,name:'Meu patch',sequence:current.sequence.slice(0,16),drums:current.drums.slice(0,4).map(r=>r.slice(0,16))};delete old.kit;delete old.presetId;delete old.swing;old.params.cutoff=777;old.sequence[3]=60;
 const migrated=migratePatch(old);assert.ok(validatePatch(migrated));assert.equal(migrated.params.cutoff,777);assert.equal(migrated.sequence[19],60);assert.equal(migrated.name,'Meu patch');assert.deepEqual(migrated.routes,old.routes);old.sequence[0]=999;assert.equal(migratePatch(old),null);
});
test('every percussion voice produces finite, bounded audio with a silent tail',()=>{
 for(const kit of new Set(allPresets.map(p=>p.kit)))for(const voice of drumTracks){const data=renderDrumSample(voice,kit,22050);let peak=0,energy=0;for(const x of data){assert.ok(Number.isFinite(x));peak=Math.max(peak,Math.abs(x));energy+=x*x;}assert.ok(peak<=1,kit+'/'+voice);assert.ok(energy>1);assert.ok(Math.abs(data.at(-1))<.001);}
 assert.notDeepEqual(renderDrumSample('slap','tamborzao',22050),renderDrumSample('slap','mandelao',22050));
});
