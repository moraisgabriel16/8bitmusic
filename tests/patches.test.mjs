import test from 'node:test';
import assert from 'node:assert/strict';
import {createPatch,validatePatch,canConnect,presets} from '../dist/synth/patches.js';

test('every vibe produces a complete, distinct, exportable patch',()=>{
 const patches=Object.keys(presets).map(genre=>createPatch(genre,37));
 for(const patch of patches){assert.ok(validatePatch(patch));assert.equal(patch.params.master,37);assert.ok(validatePatch(JSON.parse(JSON.stringify(patch))));assert.ok(patch.routes.length>0);}
 assert.equal(new Set(patches.map(p=>JSON.stringify(p.sequence))).size,patches.length);
 assert.equal(new Set(patches.map(p=>JSON.stringify(p.params))).size,patches.length);
});
test('changing or clearing a patch cannot corrupt the preset loaded next',()=>{
 const first=createPatch('funk');first.sequence.fill(0);first.drums[0].fill(0);first.params.cutoff=40;first.routes[0][1]='output.in';
 const restored=createPatch('funk');assert.ok(restored.sequence.some(Boolean));assert.ok(restored.drums[0].some(Boolean));assert.equal(restored.params.cutoff,500);assert.equal(restored.routes[0][1],'mixer.a');
});
test('audio routes reject cycles and CV/audio mismatches',()=>{
 assert.ok(canConnect('oscA.out','filter.in'));assert.ok(canConnect('filter.out','vca.in'));assert.ok(canConnect('lfo.out','oscA.cv'));assert.ok(canConnect('env.out','vca.cv'));
 for(const pair of [['filter.out','filter.in'],['vca.out','filter.in'],['env.out','output.in'],['oscA.out','filter.cv'],['lfo.out','vca.cv'],['unknown','output.in']])assert.equal(canConnect(...pair),false);
});
test('patch import rejects invalid audio settings, notes and routes',()=>{
 for(const mutate of [p=>p.params.feedback=110,p=>p.params.cutoff=null,p=>p.sequence[0]=999,p=>p.routes.push(['vca.out','filter.in']),p=>p.routes.push(p.routes[0]),p=>p.genre='toString',p=>p.drums[0].pop(),p=>p.params.waveA='invalid']){const patch=createPatch();mutate(patch);assert.equal(validatePatch(patch),false);}
 assert.throws(()=>createPatch('toString'));
});
