import { env } from 'cloudflare:workers';
import { getDb } from '../../../db';
import { candidates } from '../../../db/schema';
import {validate} from '../../lib/validation';
import {reply,sameOrigin} from '../../lib/auth';
import {publicJob,publicForm} from '../../lib/public-data';
import {validateAnswers} from '../../lib/recruitment';
export async function POST(r:Request){
 if(!sameOrigin(r))return reply({error:'Origem não autorizada.'},403);
 if(!r.headers.get('content-type')?.includes('application/json'))return reply({error:'Formato inválido.'},415);
 if(Number(r.headers.get('content-length')||0)>64000)return reply({error:'Dados muito grandes.'},413);
 try{const raw=await r.text();if(raw.length>64000)return reply({error:'Dados muito grandes.'},413);const b=JSON.parse(raw);if(!b||typeof b!=='object'||Array.isArray(b))return reply({error:'Dados inválidos.'},400);if(b.website)return reply({error:'Não foi possível enviar.'},400);let data,jobId=null,formId=null,jobTitle=null,answers='[]';try{let f=null;if(b.jobId){if(typeof b.jobId!=='string')throw Error('Vaga inválida.');const context=await publicJob(b.jobId);if(!context)throw Error('Esta vaga não está recebendo candidaturas.');f=context.form;jobId=context.job.id;jobTitle=context.job.title;b.role=context.job.role;b.unit=context.job.unit;}else if(b.formId){if(typeof b.formId!=='string')throw Error('Formulário inválido.');f=await publicForm(b.formId);if(!f)throw Error('Este formulário não está disponível.');}if(f){if(b.formVersion!==f.updatedAt)throw Error('O formulário foi atualizado. Recarregue a página antes de enviar.');formId=f.id;answers=JSON.stringify(validateAnswers(f.questions,b.answers));}data=validate(b)}catch(e){return reply({error:(e as Error).message},400)}
 const ip=r.headers.get('cf-connecting-ip')||'unknown';const hour=Math.floor(Date.now()/3600000);const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ip+':'+hour));const key=Array.from(new Uint8Array(hash),x=>x.toString(16).padStart(2,'0')).join('');
 const db=(env as any).DB;
 const lim=await db.prepare('INSERT INTO submission_limits (key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key,(hour+2)*3600000).first();
 if(lim.count>8)return reply({error:'Limite de envios atingido. Tente novamente em uma hora.'},429);
 await db.prepare('DELETE FROM submission_limits WHERE expires < ?').bind(Date.now()).run();
 const id=crypto.randomUUID(),now=new Date().toISOString();await getDb().insert(candidates).values({...data,id,createdAt:now,consentAt:now,jobId,formId,jobTitle,answers});return reply({id},201);
 }catch{return reply({error:'Não foi possível salvar. Tente novamente em alguns instantes.'},500)}
}
