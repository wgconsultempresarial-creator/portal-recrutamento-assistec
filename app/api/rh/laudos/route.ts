import {getDb} from '../../../../db';
import {maintenanceReports} from '../../../../db/schema';
import {desc} from 'drizzle-orm';
import {admin,reply,sameOrigin} from '../../../lib/auth';
import {validateDraft} from '../../../lib/maintenance';

export async function GET(){
  if(!await admin()) return reply({error:'Acesso restrito ao RH.'},403);
  try {return reply(await getDb().select({id:maintenanceReports.id,branch:maintenanceReports.branch,company:maintenanceReports.company,plate:maintenanceReports.plate,date:maintenanceReports.date,services:maintenanceReports.services,signatureMode:maintenanceReports.signatureMode,status:maintenanceReports.status,createdAt:maintenanceReports.createdAt,pdfSha256:maintenanceReports.pdfSha256}).from(maintenanceReports).orderBy(desc(maintenanceReports.createdAt)).limit(200));}
  catch {return reply({error:'Não foi possível carregar o histórico de laudos.'},500);}
}
export async function POST(r:Request){
  const user=await admin();
  if(!user) return reply({error:'Acesso restrito ao RH.'},403);
  if(!sameOrigin(r)) return reply({error:'Origem inválida.'},403);
  const raw=await r.text();
  if(raw.length>250000) return reply({error:'O laudo excede o tamanho permitido.'},413);
  let draft;
  try {draft=validateDraft(JSON.parse(raw),true);}
  catch(e){return reply({error:e instanceof Error?e.message:'Dados inválidos.'},400);}
  // A draft records the choice; issuance rechecks the current authorization.
  const record={id:crypto.randomUUID(),...draft,services:JSON.stringify(draft.services),status:'Rascunho',createdAt:new Date().toISOString(),createdBy:user.userId};
  try {await getDb().insert(maintenanceReports).values(record);return reply(record,201);}
  catch {return reply({error:'Não foi possível salvar o rascunho.'},500);}
}
