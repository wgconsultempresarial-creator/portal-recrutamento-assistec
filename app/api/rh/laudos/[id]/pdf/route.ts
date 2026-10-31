import {getDb} from '../../../../../../db';
import {maintenanceReports} from '../../../../../../db/schema';
import {eq} from 'drizzle-orm';
import {admin,reply} from '../../../../../lib/auth';
export async function GET(_r:Request,context:{params:Promise<{id:string}>}){
 if(!await admin())return reply({error:'Acesso restrito.'},403);
 const {id}=await context.params;
 if(!/^[-a-f0-9]{36}$/.test(id))return reply({error:'Laudo não encontrado.'},404);
 try{
  const [r]=await getDb().select({pdf:maintenanceReports.pdfBase64,plate:maintenanceReports.plate,status:maintenanceReports.status}).from(maintenanceReports).where(eq(maintenanceReports.id,id));
  if(!r||r.status!=='Emitido'||!r.pdf)return reply({error:'Laudo não encontrado.'},404);
  return new Response(Uint8Array.from(atob(r.pdf),c=>c.charCodeAt(0)),{headers:{'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="laudo-assistec-'+r.plate+'-'+id+'.pdf"','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
 }catch{return reply({error:'Não foi possível recuperar o PDF.'},500);}
}
