import test from 'node:test';
import assert from 'node:assert/strict';
import {createPatch,validatePatch,migratePatch} from '../dist/synth/patches.js';
import {addConnection,connectionPair,copyBar,pasteBar,transformBar,createHistory} from '../dist/synth/editing.js';

test('connections accept either endpoint first, preserve sources and are idempotent',()=>{
 const routes=createPatch().routes,original=structuredClone(routes);
 assert.deepEqual(connectionPair('filter.in','oscB.out'),['oscB.out','filter.in']);
 const next=addConnection(routes,'filter.in','oscB.out');
 assert.ok(next.some(r=>r[0]==='mixer.out'&&r[1]==='filter.in'));
 assert.ok(next.some(r=>r[0]==='oscB.out'&&r[1]==='filter.in'));
 assert.equal(addConnection(next,'oscB.out','filter.in').length,next.length);
 assert.deepEqual(routes,original);
 for(const pair of [['filter.out','mixer.a'],['env.out','oscA.cv'],['filter.cv','oscA.out'],['oscA.out','oscB.out']])assert.throws(()=>addConnection(routes,...pair));
});
test('copy, paste and rotations preserve all voices and leave other bars intact',()=>{
 const patch=createPatch('funk'),original=structuredClone(patch),clip=copyBar(patch,3);
 const pasted=pasteBar(patch,1,clip);
 assert.deepEqual(copyBar(pasted,1),clip);assert.deepEqual(copyBar(pasted,0),copyBar(patch,0));assert.deepEqual(patch,original);
 const rotated=transformBar(transformBar(patch,3,'left'),3,'right');assert.deepEqual(rotated,patch);
 const cleared=transformBar(patch,3,'clear');assert.ok(cleared.drums.every(r=>r.slice(48).every(v=>v===0)));assert.ok(cleared.sequence.slice(48).every(v=>v===0));
 assert.deepEqual(copyBar(cleared,2),copyBar(patch,2));
 clip.drums[0][0]=.123;assert.notEqual(pasted.drums[0][16],.123);
});
test('transpose respects note limits and rests',()=>{
 const patch=createPatch();patch.sequence.splice(0,4,0,24,84,60);
 assert.deepEqual(transformBar(patch,0,'up').sequence.slice(0,4),[0,25,84,61]);
 assert.deepEqual(transformBar(patch,0,'down').sequence.slice(0,4),[0,24,83,59]);
});
test('undo groups knob gestures, keeps full state, and clears redo after a new edit',()=>{
 const patch=createPatch(),history=createHistory(patch);const initial=structuredClone(patch);
 patch.params.cutoff=1000;history.record(patch,'cutoff',100);
 patch.params.cutoff=1200;history.record(patch,'cutoff',300);
 patch.routes=[];history.record(patch,undefined,310);
 assert.equal(history.undo().params.cutoff,1200);assert.deepEqual(history.undo(),initial);
 const redone=history.redo();assert.equal(redone.params.cutoff,1200);assert.deepEqual(redone.routes,initial.routes);
 redone.sequence[0]=60;history.record(redone);assert.equal(history.canRedo,false);
 redone.sequence[0]=84;assert.equal(history.undo().sequence[0],initial.sequence[0]);
});
test('optional interaction fields survive import and reject malformed modulation',()=>{
 const patch=createPatch();patch.bypass={filter:true,delay:true};patch.muted[0]=true;patch.modAmounts={'env.out|vca.cv':-50};assert.ok(validatePatch(patch));assert.deepEqual(migratePatch(JSON.parse(JSON.stringify(patch))),patch);
 for(const mutate of [p=>p.muted[0]=1,p=>p.bypass={unknown:true},p=>p.bypass=[],p=>p.modAmounts={'oscA.out|mixer.a':50},p=>p.modAmounts={'env.out|vca.cv':101},p=>p.modAmounts={'lfo.out|oscB.cv':10}]){const next=structuredClone(patch);mutate(next);assert.equal(validatePatch(next),false);}
});
