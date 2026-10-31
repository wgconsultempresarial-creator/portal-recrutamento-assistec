import {PDFDocument} from 'pdf-lib';
import {getDb} from '../../../../../db';
import {maintenanceSignatures} from '../../../../../db/schema';
import {and,eq,isNull} from 'drizzle-orm';
import {admin,reply,sameOrigin} from '../../../../lib/auth';
import {maintenanceBranches} from '../../../../lib/maintenance';

export async function GET(r:Request){
 if(!await admin())return reply({error:'Acesso restrito.'},403);
 try{
  const id=new URL(r.url).searchParams.get('image');
  if(id){
   if(!/^[-a-f0-9]{36}$/.test(id))return reply({error:'Imagem não encontrada.'},404);
   const [row]=await getDb().select({image:maintenanceSignatures.image}).from(maintenanceSignatures).where(and(eq(maintenanceSignatures.id,id),isNull(maintenanceSignatures.revokedAt)));
   if(!row)return reply({error:'Imagem não encontrada.'},404);
   const [type,data]=row.image.split(',');return new Response(Uint8Array.from(atob(data),c=>c.charCodeAt(0)),{headers:{'Content-Type':type.includes('png')?'image/png':'image/jpeg','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
  }
  return reply(await getDb().select({id:maintenanceSignatures.id,branch:maintenanceSignatures.branch,authorizedBy:maintenanceSignatures.authorizedBy,authorizedAt:maintenanceSignatures.authorizedAt}).from(maintenanceSignatures).where(isNull(maintenanceSignatures.revokedAt)));
 }
 catch{return reply({error:'Não foi possível carregar as autorizações.'},500);}
}
export async function POST(r:Request){
 const u=await admin();if(!u||!sameOrigin(r))return reply({error:'Acesso restrito.'},403);
 const raw=await r.text();if(raw.length>750000)return reply({error:'Imagem muito grande (máximo 500 KB).'},413);
 let b:{branch:string;image:string;authorized?:boolean};
 try{b=JSON.parse(raw);if(!maintenanceBranches.some(x=>x.id===b.branch)||b.authorized!==true||typeof b.image!=='string'||!/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/]+=*$/.test(b.image)||b.image.length>700000)throw Error();
  const bytes=Uint8Array.from(atob(b.image.split(',')[1]),c=>c.charCodeAt(0));if(bytes.length>500000)throw Error();
  if(b.image.startsWith('data:image/png')){
   if(bytes.length<24||![137,80,78,71,13,10,26,10].every((n,i)=>bytes[i]===n))throw Error();
   const view=new DataView(bytes.buffer);const width=view.getUint32(16),height=view.getUint32(20);
   if(!width||!height||width>2500||height>1500||width*height>2500000)throw Error();
  }
  const doc=await PDFDocument.create();const image=await(b.image.startsWith('data:image/png')?doc.embedPng(bytes):doc.embedJpg(bytes));
  if(image.width>2500||image.height>1500||image.width*image.height>2500000)throw Error();
 }catch{return reply({error:'Confirme a autorização e envie uma imagem PNG ou JPEG válida, até 500 KB e 2,5 milhões de pixels.'},400);}
 try{
  const active=await getDb().select({id:maintenanceSignatures.id}).from(maintenanceSignatures).where(and(eq(maintenanceSignatures.branch,b.branch),isNull(maintenanceSignatures.revokedAt)));
  if(active.length)return reply({error:'Revogue a autorização atual antes de cadastrar outra.'},409);
  const record={id:crypto.randomUUID(),branch:b.branch,image:b.image,authorizedBy:u.userId,authorizedAt:new Date().toISOString()};
  await getDb().insert(maintenanceSignatures).values(record);return reply({id:record.id},201);
 }catch{return reply({error:'Não foi possível cadastrar. Atualize a lista de autorizações.'},409);}
}
export async function PATCH(r:Request){
 const u=await admin();if(!u||!sameOrigin(r))return reply({error:'Acesso restrito.'},403);
 const raw=await r.text();if(raw.length>200)return reply({error:'Dados inválidos.'},400);
 try{const b=JSON.parse(raw);if(typeof b.id!=='string'||b.id.length>50)return reply({error:'Dados inválidos.'},400);
  const rows=await getDb().update(maintenanceSignatures).set({revokedBy:u.userId,revokedAt:new Date().toISOString()}).where(and(eq(maintenanceSignatures.id,b.id),isNull(maintenanceSignatures.revokedAt))).returning({id:maintenanceSignatures.id});
  return rows.length?reply({ok:true}):reply({error:'Autorização já revogada ou não encontrada.'},404);
 }catch{return reply({error:'Não foi possível revogar a autorização.'},500);}
}
