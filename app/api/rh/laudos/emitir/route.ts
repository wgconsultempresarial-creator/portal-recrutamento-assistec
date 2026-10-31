import {env} from 'cloudflare:workers';
import * as pdf from 'pdf-lib';
import {getDb} from '../../../../../db';
import {maintenanceReports,maintenanceSignatures} from '../../../../../db/schema';
import {eq,and,isNull} from 'drizzle-orm';
import {admin,reply,sameOrigin} from '../../../../lib/auth';
import {validateDraft,snapshotDraft,type MaintenanceSnapshot} from '../../../../lib/maintenance';
import {buildMaintenancePdf} from '../../../../lib/maintenance-pdf';
import {maintenanceLogo} from '../../../../lib/maintenance-logo';

export async function POST(r:Request){
 const u=await admin();if(!u||!sameOrigin(r))return reply({error:'Acesso restrito.'},403);
 const raw=await r.text();if(raw.length>250000)return reply({error:'O laudo excede o tamanho permitido.'},413);
 let b,draft;
 try{b=JSON.parse(raw);draft=validateDraft(b,true);if(typeof b.issueId!=='string'||!/^[-a-f0-9]{36}$/.test(b.issueId))throw Error('Identificador de emissão inválido.');}
 catch(e){return reply({error:e instanceof Error?e.message:'Dados inválidos.'},400);}
 try{
  const previous=await getDb().select().from(maintenanceReports).where(eq(maintenanceReports.id,b.issueId));
  if(previous.length){
   const old=previous[0],s=old.snapshot?JSON.parse(old.snapshot):null;
   if(old.createdBy!==u.userId||old.status!=='Emitido'||!s||JSON.stringify(validateDraft(s,true))!==JSON.stringify(draft)||(s.signature?.id??null)!==(b.signatureId??null))return reply({error:'Esta emissão já existe com outros dados. Atualize o formulário.'},409);
   return reply({id:old.id,url:'/api/rh/laudos/'+old.id+'/pdf'});
  }
  let signature=null;
  if(draft.signatureMode==='authorized'){
   if(typeof b.signatureId!=='string')return reply({error:'Selecione uma assinatura autorizada.'},400);
   const rows=await getDb().select().from(maintenanceSignatures).where(and(eq(maintenanceSignatures.id,b.signatureId),eq(maintenanceSignatures.branch,draft.branch),isNull(maintenanceSignatures.revokedAt)));
   if(!rows.length)return reply({error:'Assinatura indisponível para esta filial. Atualize as autorizações.'},409);
   signature=rows[0];
  }else if(b.signatureId)return reply({error:'Assinatura manual não utiliza autorização.'},400);
  const snapshot:MaintenanceSnapshot={...snapshotDraft(draft),id:b.issueId,createdAt:new Date().toISOString(),createdBy:u.userId,signature};
  const bytes=await buildMaintenancePdf(snapshot,pdf,maintenanceLogo);
  let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new Uint8Array(bytes).buffer))).map(x=>x.toString(16).padStart(2,'0')).join('');
  const result=await env.DB!.prepare("INSERT INTO maintenance_reports (id,branch,company,plate,date,services,signature_mode,status,created_at,created_by,snapshot,pdf_base64,pdf_sha256) SELECT ?,?,?,?,?,?,?,'Emitido',?,?,?,?,? WHERE ? IS NULL OR EXISTS (SELECT 1 FROM maintenance_signatures WHERE id=? AND branch=? AND revoked_at IS NULL)")
   .bind(snapshot.id,draft.branch,draft.company,draft.plate,draft.date,JSON.stringify(draft.services),draft.signatureMode,snapshot.createdAt,u.userId,JSON.stringify(snapshot),btoa(binary),hash,signature?.id??null,signature?.id??null,draft.branch).run();
  if(!result.meta.changes)return reply({error:'A autorização foi revogada durante a emissão. Atualize as autorizações.'},409);
  return reply({id:snapshot.id,url:'/api/rh/laudos/'+snapshot.id+'/pdf'},201);
 }catch{return reply({error:'Não foi possível emitir o PDF. Tente novamente; o identificador será preservado para evitar duplicação.'},500);}
}
