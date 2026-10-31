import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {buildMaintenancePdf} from '../app/lib/maintenance-pdf.ts';
import {maintenanceLogo} from '../app/lib/maintenance-logo.ts';
import {snapshotDraft,validateDraft} from '../app/lib/maintenance.ts';
const lib=createRequire(import.meta.url)('pdf-lib');
const base=()=>({...snapshotDraft(validateDraft({branch:'sumare',company:'Empresa de teste',plate:'ABC1D23',date:'2026-10-31',services:['Inspeção pneumática','Correção de vazamento'],signatureMode:'manual'})),id:'00000000-0000-4000-8000-000000000001',createdAt:'2026-10-31T18:00:00.000Z',createdBy:'qa'});
test('creates readable A4 manual PDFs for each branch',async()=>{
 for(const branch of ['sumare','cubatao','ribeirao-preto']){
  const s={...base(),...snapshotDraft(validateDraft({...base(),branch}))};
  const bytes=await buildMaintenancePdf(s,lib,maintenanceLogo);
  const doc=await lib.PDFDocument.load(bytes);
  assert.equal(doc.getPageCount(),1);assert.equal(doc.getTitle(),'Laudo de manutenção - ABC1D23');
  assert.equal(Math.round(doc.getPage(0).getWidth()),595);
 }
});
test('paginates long multiline services and unbroken strings without losing pages',async()=>{
 const s=base();s.services=Array.from({length:80},(_,i)=>'Serviço '+i+': '+('verificação de funcionamento '.repeat(12))+'\n'+('A'.repeat(180)));
 const doc=await lib.PDFDocument.load(await buildMaintenancePdf(s,lib,maintenanceLogo));
 assert.ok(doc.getPageCount()>10);
});
test('can embed a registered PNG signature without putting it in public assets',async()=>{
 const s=base();s.signatureMode='authorized';s.signature={id:'grant-qa',image:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==',authorizedBy:'qa',authorizedAt:s.createdAt};
 const bytes=await buildMaintenancePdf(s,lib,maintenanceLogo);assert.ok(bytes.length>5000);
});
test('rejects unsupported characters before a PDF is issued',()=>{
 assert.throws(()=>validateDraft({...base(),company:'Empresa 🚗'}),/letras/);
});
