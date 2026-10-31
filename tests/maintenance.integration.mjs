// Run after production build: node tests/maintenance.integration.mjs
// Uses only isolated local D1 state and synthetic dispatch identities.
import {createRequire} from 'node:module';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const root=process.cwd(),require=createRequire(root+'/package.json');
const {Miniflare}=createRequire(require.resolve('wrangler/package.json'))('miniflare');
const mf=new Miniflare({cf:false,modules:[{type:'ESModule',path:root+'/dist/server/index.js'},...fs.readdirSync(root+'/dist/server',{recursive:true}).filter(f=>/\.m?js$/.test(f)&&f!=='index.js').map(f=>({type:'ESModule',path:root+'/dist/server/'+f}))],modulesRoot:root+'/dist/server',compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],bindings:{RH_EMAILS:'qa@example.com'},assets:{directory:root+'/dist/client',binding:'ASSETS',routerConfig:{has_user_worker:true,invoke_user_worker_ahead_of_assets:true}}});
const headers={'oai-authenticated-user-id':'qa','oai-authenticated-user-email':'qa@example.com'};
async function call(path,method='GET',body,auth=true,origin='http://localhost'){
 const r=await mf.dispatchFetch('http://localhost'+path,{method,headers:{...(auth?headers:{}),...(method==='GET'?{}:{'Content-Type':'application/json',Origin:origin})},...(body?{body:JSON.stringify(body)}:{})});
 return {r,b:r.headers.get('content-type')?.includes('json')?await r.json():new Uint8Array(await r.arrayBuffer())};
}
try{
 const db=await mf.getD1Database('DB');
 for(const file of fs.readdirSync(root+'/drizzle').filter(f=>f.endsWith('.sql')).sort())for(const s of fs.readFileSync(root+'/drizzle/'+file,'utf8').split('--> statement-breakpoint').map(s=>s.trim()).filter(Boolean))await db.prepare(s).run();
 for(const path of ['/api/rh/laudos','/api/rh/laudos/assinaturas','/api/rh/laudos/00000000-0000-4000-8000-000000000001/pdf'])assert.equal((await call(path,'GET',null,false)).r.status,403);
 const draft={company:'Empresa QA',plate:'ABC1D23',date:'2026-10-31',branch:'sumare',services:['Teste de manutenção'],signatureMode:'manual'};
 assert.equal((await call('/api/rh/laudos/emitir','POST',draft,false)).r.status,403);
 assert.equal((await call('/api/rh/laudos/emitir','POST',draft,true,'https://other.test')).r.status,403);
 assert.equal((await call('/api/rh/laudos','POST',draft)).r.status,201);
 const issueId=crypto.randomUUID();
 let issued=await call('/api/rh/laudos/emitir','POST',{...draft,issueId});assert.equal(issued.r.status,201,JSON.stringify(issued.b));
 const original=await call(issued.b.url);assert.equal(original.r.status,200);assert.equal(new TextDecoder().decode(original.b.slice(0,5)),'%PDF-');
 assert.equal((await call('/api/rh/laudos/emitir','POST',{...draft,issueId})).r.status,200);
 assert.equal((await call('/api/rh/laudos/emitir','POST',{...draft,company:'Outro dado',issueId})).r.status,409);
 const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==';
 assert.equal((await call('/api/rh/laudos/assinaturas','POST',{branch:'sumare',image:png})).r.status,400);
 const grant=await call('/api/rh/laudos/assinaturas','POST',{branch:'sumare',image:png,authorized:true});assert.equal(grant.r.status,201,JSON.stringify(grant.b));
 const signatureId=grant.b.id;
 assert.equal((await call('/api/rh/laudos/assinaturas','POST',{branch:'sumare',image:png,authorized:true})).r.status,409);
 assert.equal((await call('/api/rh/laudos/emitir','POST',{...draft,branch:'cubatao',signatureMode:'authorized',signatureId,issueId:crypto.randomUUID()})).r.status,409);
 issued=await call('/api/rh/laudos/emitir','POST',{...draft,signatureMode:'authorized',signatureId,issueId:crypto.randomUUID()});assert.equal(issued.r.status,201,JSON.stringify(issued.b));
 const signed=await call(issued.b.url);
 assert.equal((await call('/api/rh/laudos/assinaturas','PATCH',{id:signatureId})).r.status,200);
 assert.equal((await call('/api/rh/laudos/emitir','POST',{...draft,signatureMode:'authorized',signatureId,issueId:crypto.randomUUID()})).r.status,409);
 assert.deepEqual((await call(issued.b.url)).b,signed.b,'Revoking a signature must preserve previously issued PDF bytes');
 const history=await call('/api/rh/laudos');assert.equal(history.r.status,200);assert.ok(history.b.some(x=>x.status==='Emitido'));
 assert.ok(!JSON.stringify(history.b).includes('data:image'),'History summaries must not expose raw signature images');
 console.log('Maintenance integration checks passed.');
}finally{await mf.dispose();}
