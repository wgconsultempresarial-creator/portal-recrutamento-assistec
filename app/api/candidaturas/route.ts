import { env } from 'cloudflare:workers';
import { getDb } from '../../../db';
import { candidates } from '../../../db/schema';
import {validate} from '../../lib/validation';
import {reply,sameOrigin} from '../../lib/auth';
export async function POST(r:Request){
 if(!sameOrigin(r))return reply({error:'Origem não autorizada.'},403);
 if(!r.headers.get('content-type')?.includes('application/json'))return reply({error:'Formato inválido.'},415);
 if(Number(r.headers.get('content-length')||0)>16000)return reply({error:'Dados muito grandes.'},413);
 try{const raw=await r.text();if(raw.length>16000)return reply({error:'Dados muito grandes.'},413);const b=JSON.parse(raw);if(b.website)return reply({error:'Não foi possível enviar.'},400);let data;try{data=validate(b)}catch(e){return reply({error:(e as Error).message},400)}
 const ip=r.headers.get('cf-connecting-ip')||'unknown';const hour=Math.floor(Date.now()/3600000);const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ip+':'+hour));const key=Array.from(new Uint8Array(hash),x=>x.toString(16).padStart(2,'0')).join('');
 const db=(env as any).DB;
 const lim=await db.prepare('INSERT INTO submission_limits (key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key,(hour+2)*3600000).first();
 if(lim.count>8)return reply({error:'Limite de envios atingido. Tente novamente em uma hora.'},429);
 await db.prepare('DELETE FROM submission_limits WHERE expires < ?').bind(Date.now()).run();
 const id=crypto.randomUUID(),now=new Date().toISOString();await getDb().insert(candidates).values({...data,id,createdAt:now,consentAt:now});return reply({id},201);
 }catch{return reply({error:'Não foi possível salvar. Tente novamente em alguns instantes.'},500)}
}
