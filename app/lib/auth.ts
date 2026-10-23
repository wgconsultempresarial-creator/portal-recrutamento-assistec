import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../chatgpt-auth';
export async function admin(){const u=await getChatGPTUser();const allowed=((env as any).RH_EMAILS||'').toLowerCase().split(',').map((s:string)=>s.trim());return u&&allowed.includes(u.email.toLowerCase())?u:null;}
export function sameOrigin(r:Request){return r.headers.get('origin')===new URL(r.url).origin;}
export function reply(data:any,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
