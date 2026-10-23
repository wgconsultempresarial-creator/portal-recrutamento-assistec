// Run after building: node tests/recruitment.integration.mjs
// Uses an ephemeral local D1 database and synthetic dispatch identity headers. No production data or secrets.
import {createRequire} from 'node:module';
import path from 'node:path';import fs from 'node:fs';
const root=process.cwd();const require=createRequire(root+'/package.json');const mfRequire=createRequire(require.resolve('wrangler/package.json'));const {Miniflare}=mfRequire('miniflare');
const mf=new Miniflare({cf:false,modules:[{type:'ESModule',path:root+'/dist/server/index.js'},...fs.readdirSync(root+'/dist/server',{recursive:true}).filter(f=>/\.m?js$/.test(f)&&f!=='index.js').map(f=>({type:'ESModule',path:root+'/dist/server/'+f}))],modulesRoot:root+'/dist/server',compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],bindings:{RH_EMAILS:'qa@example.com'},assets:{directory:root+'/dist/client',binding:'ASSETS',routerConfig:{has_user_worker:true,invoke_user_worker_ahead_of_assets:true}}});

let checks=0;const assert=(ok,message)=>{if(!ok)throw Error(message);checks++};
const adminHeaders={'oai-authenticated-user-id':'local-qa-admin','oai-authenticated-user-email':'qa@example.com'};
async function request(url,method='GET',body,auth=false,origin='http://localhost'){
 const response=await mf.dispatchFetch('http://localhost'+url,{method,headers:{...(auth?adminHeaders:{}),...(method!=='GET'?{'Content-Type':'application/json',Origin:origin}: {})},...(body!==undefined?{body:JSON.stringify(body)}:{})});const text=await response.text();let data;try{data=JSON.parse(text)}catch{data=text}return{status:response.status,data};
}
try{
 const db=await mf.getD1Database('DB');
 const files=fs.readdirSync(root+'/drizzle').filter(f=>f.endsWith('.sql')).sort();
 async function migrate(file){for(const sql of fs.readFileSync(root+'/drizzle/'+file,'utf8').split('--> statement-breakpoint').map(s=>s.trim()).filter(Boolean))await db.prepare(sql).run()}
 await migrate(files[0]);
 await db.prepare("INSERT INTO candidates(id,name,phone,email,city,role,unit,experience,skills,availability,created_at,consent_at) VALUES ('legacy','Perfil anterior','11900000000','legacy@example.com','Sumaré, SP','Mecânico de pesados','Sumaré','1 a 3 anos','Manutenção de caminhões','Imediata','2026-01-01T12:00:00Z','2026-01-01T12:00:00Z')").run();
 for(const file of files.slice(1))await migrate(file);
 assert((await db.prepare("SELECT answers,job_id FROM candidates WHERE id='legacy'").first()).answers==='[]','Migration must preserve existing applications');
 for(const url of ['/api/rh','/api/rh/formularios','/api/rh/vagas'])assert((await request(url)).status===403,'Anonymous access must be denied: '+url);
 const other=await mf.dispatchFetch('http://localhost/api/rh',{headers:{...adminHeaders,'oai-authenticated-user-email':'other@example.com'}});assert(other.status===403,'A signed-in unapproved account must be denied');
 assert((await request('/api/rh/formularios','POST',{},true,'https://external.test')).status===403,'Reject cross-origin management');
 const form={title:'Perfil administrativo',description:'Perguntas profissionais para a oportunidade.',status:'Rascunho',questions:[{id:'excel',label:'Conhecimento de Excel',type:'select',required:true,options:['Básico','Avançado']},{id:'systems',label:'Sistemas que utiliza',type:'multiselect',required:false,options:['ERP','Planilhas']},{id:'years',label:'Anos na função',type:'number',required:false,options:[]}]};
 const bad=structuredClone(form);bad.questions[0].options=['Básico','Básico'];assert((await request('/api/rh/formularios','POST',bad,true)).status===400,'Reject duplicate question choices');
 const created=await request('/api/rh/formularios','POST',form,true);assert(created.status===201,'Create draft form: '+JSON.stringify(created));const fid=created.data.id;
 assert((await request('/formularios/'+fid)).data.includes('Formulário indisponível'),'Draft forms must not be public');
 const job={title:'Auxiliar administrativo - QA',role:'Auxiliar administrativo',unit:'Escritório',description:'Atendimento e organização de documentos da equipe.',requirements:'Conhecimento de planilhas',contract:'CLT',schedule:'Segunda a sexta',openings:2,closesAt:null,formId:fid,status:'Aberta'};
 assert((await request('/api/rh/vagas','POST',job,true)).status===400,'Cannot publish a vacancy with a draft form');
 let stored=(await request('/api/rh/formularios','GET',undefined,true)).data.find(x=>x.id===fid);assert((await request('/api/rh/formularios','PATCH',{...stored,status:'Publicado'},true)).status===200,'Publish form');
 stored=(await request('/api/rh/formularios','GET',undefined,true)).data.find(x=>x.id===fid);
 const jc=await request('/api/rh/vagas','POST',{...job,status:'Rascunho'},true);assert(jc.status===201,'Create draft vacancy');const jid=jc.data.id;
 assert((await request('/vagas/'+jid)).data.includes('Vaga indisponível'),'Draft jobs must not accept applications');
 let j=(await request('/api/rh/vagas','GET',undefined,true)).data.find(x=>x.id===jid);assert((await request('/api/rh/vagas','PATCH',{...j,status:'Aberta'},true)).status===200,'Open job');
 assert((await request('/')).data.includes(job.title),'Open vacancy appears on public portal');
 const candidate={name:'Candidatura fictícia',phone:'11900000000',email:'candidate@example.com',city:'Sumaré, SP',role:'Cargo adulterado',unit:'Unidade adulterada',experience:'1 a 3 anos',skills:'Experiência profissional de teste',availability:'Imediata',consent:true,jobId:jid,formId:fid,formVersion:stored.updatedAt,answers:{excel:'Avançado',systems:['ERP','Planilhas'],years:'3'}};
 assert((await request('/api/candidaturas','POST',{...candidate,answers:{}})).status===400,'Required question must be answered');
 assert((await request('/api/candidaturas','POST',{...candidate,answers:{...candidate.answers,excel:'Inexistente'}})).status===400,'Reject unknown answer choices');
 assert((await request('/api/candidaturas','POST',{...candidate,answers:{...candidate.answers,years:'NaN'}})).status===400,'Reject invalid numbers');
 assert((await request('/api/candidaturas','POST',{...candidate,formVersion:'old-version'})).status===400,'Reject stale form versions');
 const submission=await request('/api/candidaturas','POST',candidate);assert(submission.status===201,'Accept valid vacancy application: '+JSON.stringify(submission));
 let all=(await request('/api/rh','GET',undefined,true)).data;const received=all.find(x=>x.id===submission.data.id);assert(received.role===job.role&&received.unit===job.unit&&received.jobTitle===job.title,'Job metadata must be enforced by server');assert(JSON.parse(received.answers)[0].label==='Conhecimento de Excel','Store question-label snapshot');assert(JSON.parse(received.answers)[1].value.length===2,'Store multiple answers');
 const old=structuredClone(stored);const changed=structuredClone(stored);changed.questions[0].label='Excel: nível informado';assert((await request('/api/rh/formularios','PATCH',changed,true)).status===200,'Edit form');
 assert((await request('/api/rh/formularios','PATCH',old,true)).status===409,'Prevent stale concurrent edit');
 all=(await request('/api/rh','GET',undefined,true)).data;assert(JSON.parse(all.find(x=>x.id===submission.data.id).answers)[0].label==='Conhecimento de Excel','Edits must preserve historic answer labels');
 assert((await request('/api/candidaturas','POST',candidate)).status===400,'Reject application after form changes until refreshed');
 j=(await request('/api/rh/vagas','GET',undefined,true)).data.find(x=>x.id===jid);assert((await request('/api/rh/vagas','PATCH',{...j,status:'Encerrada'},true)).status===200,'Close job');
 assert((await request('/api/candidaturas','POST',candidate)).status===400,'Reject closed vacancy applications');assert(!(await request('/')).data.includes(job.title),'Closed vacancy disappears from public listing');
 stored=(await request('/api/rh/formularios','GET',undefined,true)).data.find(x=>x.id===fid);assert((await request('/api/rh/formularios','PATCH',{...stored,status:'Arquivado'},true)).status===200,'Archive form');assert((await request('/formularios/'+fid)).data.includes('Formulário indisponível'),'Archived forms must be unavailable');
 const pool={...candidate,jobId:undefined,formId:undefined,formVersion:undefined,role:'Analista financeiro',unit:'Sumaré',answers:{}};assert((await request('/api/candidaturas','POST',pool)).status===201,'General talent pool accepts other professions');assert((await request('/api/candidaturas','POST',{...pool,consent:false})).status===400,'Consent remains mandatory');
 console.log(JSON.stringify({passed:checks,environment:'isolated local D1',outboundMetadataFetch:false}));
}finally{await mf.dispose()}
