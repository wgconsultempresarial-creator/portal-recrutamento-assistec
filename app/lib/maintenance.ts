// Legal details and fixed wording must be transcribed from the three source DOCX.
// Keep issuance disabled until those sources and the visual layout are approved.
export const maintenanceBranches = [
  {id:'sumare', name:'Sumaré', email:null},
  {id:'cubatao', name:'Cubatão', email:null},
  {id:'ribeirao-preto', name:'Ribeirão Preto', email:'ribpreto@assistecpneumatica.com.br'},
] as const;
export type MaintenanceDraft = {
  branch:string; company:string; plate:string; date:string;
  services:string[]; signatureMode:'manual'|'authorized';
};
export function validateDraft(value:unknown):MaintenanceDraft {
  if(!value || typeof value!=='object') throw Error('Dados inválidos.');
  const b=value as Record<string,unknown>;
  if(!maintenanceBranches.some(x=>x.id===b.branch)) throw Error('Selecione uma filial válida.');
  if(typeof b.company!=='string'||!b.company.trim()||b.company.trim().length>200) throw Error('Informe a empresa (até 200 caracteres).');
  const plate=typeof b.plate==='string'?b.plate.trim().toUpperCase().replace(/[- ]/g,''):'';
  if(!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(plate)) throw Error('Informe uma placa brasileira válida.');
  if(typeof b.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(b.date)||!Number.isFinite(Date.parse(b.date+'T12:00:00Z'))||new Date(b.date+'T12:00:00Z').toISOString().slice(0,10)!==b.date) throw Error('Informe uma data válida.');
  if(!Array.isArray(b.services)||!b.services.length||b.services.some(s=>typeof s!=='string'||!s.trim()||s.trim().length>2000)) throw Error('Preencha todos os serviços (até 2.000 caracteres por item).');
  if(b.signatureMode!=='manual'&&b.signatureMode!=='authorized') throw Error('Selecione o tipo de assinatura.');
  if(b.signatureMode==='authorized') throw Error('A filial ainda não possui assinatura/carimbo cadastrado e autorizado.');
  return {branch:b.branch as string,company:b.company.trim(),plate,date:b.date,services:b.services.map(s=>(s as string).trim()),signatureMode:b.signatureMode};
}
