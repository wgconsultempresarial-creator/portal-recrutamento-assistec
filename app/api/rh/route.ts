import {getDb} from '../../../db';
import {candidates} from '../../../db/schema';
import {desc,eq} from 'drizzle-orm';
import {admin,reply,sameOrigin} from '../../lib/auth';
import {statuses} from '../../lib/validation';
export async function GET(){if(!await admin())return reply({error:'Acesso restrito ao RH.'},403);return reply(await getDb().select().from(candidates).orderBy(desc(candidates.createdAt)));}
export async function PATCH(r:Request){const u=await admin();if(!u)return reply({error:'Acesso restrito.'},403);if(!sameOrigin(r))return reply({error:'Origem inválida.'},403);try{const raw=await r.text();if(raw.length>12000)return reply({error:'Dados muito grandes.'},413);const b=JSON.parse(raw);if(typeof b.id!=='string'||!statuses.includes(b.status)||typeof b.notes!=='string'||b.notes.length>5000)return reply({error:'Dados inválidos.'},400);await getDb().update(candidates).set({status:b.status,notes:b.notes,updatedBy:u.userId}).where(eq(candidates.id,b.id));return reply({ok:true});}catch{return reply({error:'Não foi possível atualizar.'},500)}}
export async function DELETE(r:Request){if(!await admin())return reply({error:'Acesso restrito.'},403);if(!sameOrigin(r))return reply({error:'Origem inválida.'},403);try{const b=await r.json() as any;if(typeof b.id!=='string'||b.id.length>60)return reply({error:'ID inválido.'},400);await getDb().delete(candidates).where(eq(candidates.id,b.id));return reply({ok:true})}catch{return reply({error:'Não foi possível excluir.'},500)}}
