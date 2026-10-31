// Transcribed from the three source DOCX; Sumare legal address confirmed by user.
// Source files and signature images must never be committed to this public repo.
export const maintenanceText = {
 introduction:'Confirmamos que o veículo mencionado foi submetido a manutenção, onde foram realizados os seguintes serviços:',
 conclusion:'O veículo está agora em condições de uso e todos os serviços necessários foram concluídos com sucesso.',
};
export const maintenanceTemplateVersion='2026-10-31-docx-v1';
export const maintenanceBranches = [
  {id:'sumare', name:'Sumaré', email:'sumare@assistecpneumatica.com.br',legalName:'V. H. CODOGNOTO DA SILVA LTDA',cnpj:'29.523.564/0001-90',phone:'019 3044-8119',address:'Rua Entusiasmo, 100 Americana - SP - CEP: 13477-732',signatureLabel:'ASSISTEC - MANUTENCAO PNEUMATICA E ELETRICA'},
  {id:'cubatao', name:'Cubatão', email:'cubatao@assistecpneumatica.com.br',legalName:'ASSISTEC - MANUTENCAO PNEUMATICA E ELETRICA LTDA',cnpj:'42.378.571/0001-04',phone:'019 3199-4822',address:'Rua Epitácio Pessoa, 89 Cubatão SP - CEP: 11550-020',signatureLabel:'ASSISTEC - MANUTENCAO PNEUMATICA E ELETRICA LTDA'},
  {id:'ribeirao-preto', name:'Ribeirão Preto', email:'ribpreto@assistecpneumatica.com.br',legalName:'ASSISTEC MANUTENCAO E REPARACAO RB LTDA',cnpj:'46.283.458/0001-04',phone:'019 3044-8119',address:'Avenida Ticiano Mazzetto, 301 Ribeirão Preto SP - CEP: 14073-800',signatureLabel:'ASSISTEC – MANUTENCAO E REPARACAO RB LTDA'},
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
