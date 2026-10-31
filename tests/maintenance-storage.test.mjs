import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
test('migrations preserve applications and enforce signature revocation at issuance',()=>{
 const db=new DatabaseSync(':memory:');
 try{
  const files=fs.readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort();
  for(const [i,f] of files.entries()){
   db.exec(fs.readFileSync(new URL('../drizzle/'+f,import.meta.url),'utf8'));
   if(i===0)db.exec("INSERT INTO candidates(id,name,phone,email,city,role,unit,experience,skills,availability,created_at,consent_at) VALUES ('legacy','Perfil anterior','11900000000','qa@example.com','Sumaré','Mecânico','Sumaré','1 ano','Manutenção','Imediata','2026-01-01','2026-01-01')");
  }
  assert.equal(db.prepare('SELECT name FROM candidates WHERE id=?').get('legacy').name,'Perfil anterior');
  db.prepare('INSERT INTO maintenance_signatures(id,branch,image,authorized_by,authorized_at) VALUES (?,?,?,?,?)').run('grant','sumare','test','qa','2026-10-31');
  assert.throws(()=>db.prepare('INSERT INTO maintenance_signatures(id,branch,image,authorized_by,authorized_at) VALUES (?,?,?,?,?)').run('other','sumare','test','qa','2026-10-31'));
  const route=fs.readFileSync(new URL('../app/api/rh/laudos/emitir/route.ts',import.meta.url),'utf8');
  const sql=route.match(/prepare\("(INSERT INTO maintenance_reports[^"\n]+)"\)/)[1];
  const insert=(id,branch,grant)=>db.prepare(sql).run(id,branch,'QA','ABC1D23','2026-10-31','["Teste"]',grant?'authorized':'manual','2026-10-31','qa','{}','JVBERi0=','hash',grant,grant,branch);
  assert.equal(insert('manual','sumare',null).changes,1);
  assert.equal(insert('wrong-branch','cubatao','grant').changes,0);
  assert.equal(insert('signed','sumare','grant').changes,1);
  db.prepare('UPDATE maintenance_signatures SET revoked_at=? WHERE id=?').run('2026-11-01','grant');
  assert.equal(insert('revoked','sumare','grant').changes,0);
  assert.equal(db.prepare('SELECT status FROM maintenance_reports WHERE id=?').get('signed').status,'Emitido');
  assert.equal(db.prepare('SELECT count(*) AS n FROM maintenance_reports').get().n,2);
 }finally{db.close();}
});
