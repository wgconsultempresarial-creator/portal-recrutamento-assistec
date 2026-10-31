import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateDraft,maintenanceBranches} from '../app/lib/maintenance.ts';
const draft={branch:'sumare',company:' Empresa de exemplo ',plate:'abc-1234',date:'2026-10-31',services:[' Inspeção '],signatureMode:'manual'};
test('normalizes a valid manual draft and supports Mercosul plates',()=>{
 assert.equal(validateDraft(draft).company,'Empresa de exemplo');
 assert.equal(validateDraft(draft).plate,'ABC1234');
 assert.deepEqual(validateDraft(draft).services,['Inspeção']);
 assert.equal(validateDraft({...draft,plate:'abc1d23'}).plate,'ABC1D23');
});
test('rejects invalid dates, unknown branches, empty services and invalid plates',()=>{
 for(const patch of [{date:'2026-02-30'},{date:'2026-13-01'},{branch:'outra'},{services:[]},{services:[' ']},{plate:'abc'},{company:''}]) assert.throws(()=>validateDraft({...draft,...patch}));
});
test('never accepts an unauthorized signature',()=>{
 assert.throws(()=>validateDraft({...draft,signatureMode:'authorized'}),/autorizado/);
 assert.throws(()=>validateDraft({...draft,signatureMode:'digital'}));
});
test('preserves the approved Ribeirão Preto email',()=>{
 assert.equal(maintenanceBranches.find(b=>b.id==='ribeirao-preto')?.email,'ribpreto@assistecpneumatica.com.br');
});
