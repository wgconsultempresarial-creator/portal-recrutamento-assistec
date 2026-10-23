export const roles=['Mecânico de pesados','Borracheiro de pesados'];
export const units=['Sumaré','Cubatão','Ribeirão Preto','Pneus na Estrada','Qualquer unidade'];
export const statuses=['Novo','Em análise','Entrevista','Aprovado','Não selecionado'];
export function validate(b:any){
 const out:any={};for(const k of ['name','phone','email','city','role','unit','experience','skills','availability']){if(typeof b[k]!=='string')throw Error('Preencha todos os campos obrigatórios.');out[k]=b[k].trim();}
 for(const k of ['name','city'])if(out[k].length<2||out[k].length>120)throw Error('Confira o nome e a cidade.');
 if(!/^\+?[\d ()-]{10,22}$/.test(out.phone)||out.phone.replace(/\D/g,'').length<10)throw Error('Informe um telefone válido com DDD.');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(out.email)||out.email.length>180)throw Error('Informe um e-mail válido.');
 if(out.role.length<2||out.role.length>120||out.unit.length<2||out.unit.length>120)throw Error('Selecione um cargo e uma unidade válidos.');
 if(!['Sem experiência','Até 1 ano','1 a 3 anos','3 a 5 anos','Mais de 5 anos'].includes(out.experience))throw Error('Selecione sua experiência.');
 if(!['Imediata','Em até 15 dias','Em até 30 dias','A combinar'].includes(out.availability))throw Error('Selecione sua disponibilidade.');
 if(out.skills.length<5||out.skills.length>2000)throw Error('Descreva sua experiência em 5 a 2.000 caracteres.');
 if(b.consent!==true)throw Error('É necessário autorizar o uso dos dados para recrutamento.');return out;
}
