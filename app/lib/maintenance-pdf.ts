import type {MaintenanceSnapshot} from './maintenance';
type Library=typeof import('pdf-lib');

// Kept separate from the library import so pagination is testable without Workers.
export async function buildMaintenancePdf(s:MaintenanceSnapshot,lib:Library,logo:string){
 const {PDFDocument,StandardFonts,rgb}=lib;
 const doc=await PDFDocument.create();
 doc.setTitle('Laudo de manutenção - '+s.plate);doc.setAuthor(s.branchData.legalName);
 doc.setCreationDate(new Date(s.createdAt));
 const regular=await doc.embedFont(StandardFonts.Helvetica),bold=await doc.embedFont(StandardFonts.HelveticaBold);
 const brand=await doc.embedJpg(Uint8Array.from(atob(logo),c=>c.charCodeAt(0)));
 const signature=s.signature?await (s.signature.image.startsWith('data:image/png')?doc.embedPng(s.signature.image):doc.embedJpg(s.signature.image)):null;
 const ink=rgb(.09,.14,.13),red=rgb(.87,.20,.17);
 let page=doc.addPage([595.28,841.89]),y=0;
 function wrap(text:string,font=regular,size=11,width=511){
  const lines:string[]=[];
  for(const paragraph of text.replace(/\r\n?/g,'\n').split('\n')){
   let line='';
   for(const word of paragraph.replace(/\t/g,'    ').split(' ')){
    if(line&&font.widthOfTextAtSize(line+' '+word,size)>width){lines.push(line);line='';}
    for(const ch of (line?' ':'')+word){if(font.widthOfTextAtSize(line+ch,size)>width&&line){lines.push(line);line='';}line+=ch;}
   }
   lines.push(line);
  }
  return lines;
 }
 function line(text:string,x:number,at:number,size=11,font=regular){page.drawText(text,{x,y:at,size,font,color:ink});}
 function header(){
  page.drawImage(brand,{x:42,y:707,width:130,height:95});
  line('LAUDO DE MANUTENÇÃO',595-42-bold.widthOfTextAtSize('LAUDO DE MANUTENÇÃO',16),765,16,bold);
  line(s.branchData.name,553-regular.widthOfTextAtSize(s.branchData.name,11),742);
  page.drawLine({start:{x:42,y:697},end:{x:553,y:697},thickness:2,color:red});
  line('Laudo '+s.id,42,679,8);y=642;
 }
 function next(){page=doc.addPage([595.28,841.89]);header();}
 function space(height:number){if(y-height<165)next();}
 function paragraph(text:string,font=regular,size=11,indent=0){
  for(const l of wrap(text,font,size,511-indent)){space(17);line(l,42+indent,y,size,font);y-=17;}
  y-=8;
 }
 header();
 paragraph('EMPRESA: '+s.company,bold);paragraph('PLACA: '+s.plate+'     DATA DA MANUTENÇÃO: '+s.date.split('-').reverse().join('/'));
 y-=8;paragraph('Descrição da manutenção realizada',bold,12);paragraph(s.texts.introduction);
 s.services.forEach((service,i)=>paragraph((i+1)+'. '+service,regular,11,10));
 space(85);y-=8;paragraph('Observações',bold,12);paragraph(s.texts.conclusion);
 space(130);y=215;
 if(signature){const scale=Math.min(180/signature.width,65/signature.height);page.drawImage(signature,{x:(595-signature.width*scale)/2,y:y+8,width:signature.width*scale,height:signature.height*scale});}
 page.drawLine({start:{x:150,y},end:{x:445,y},thickness:.6,color:ink});y-=16;
 for(const l of wrap(s.branchData.signatureLabel,regular,8,470)){line(l,(595-regular.widthOfTextAtSize(l,8))/2,y,8);y-=12;}
 line(s.signature?'Assinatura/carimbo com autorização registrada':'Assinatura e carimbo manual',160,y-3,8);
 const pages=doc.getPages();
 pages.forEach((p,i)=>{
  page=p;p.drawLine({start:{x:42,y:139},end:{x:553,y:139},thickness:1.5,color:red});let fy=122;
  for(const [text,font] of [[s.branchData.legalName,bold],['Tel.: '+s.branchData.phone+' | E-mail: '+s.branchData.email,regular],['CNPJ '+s.branchData.cnpj+' | '+s.branchData.address,regular]] as const){
   for(const l of wrap(text,font,8.5)){line(l,42,fy,8.5,font);fy-=12;}
  }
  line('Emitido em '+new Date(s.createdAt).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'}),42,42,7);
  line('Página '+(i+1)+' de '+pages.length,470,42,8);
 });
 return doc.save();
}
