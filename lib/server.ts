import { env } from 'cloudflare:workers';
export { env };
export function db(){if(!env.DB)throw new Error('Database unavailable'); return env.DB;}
export class HttpError extends Error { constructor(public status:number,message:string){super(message);} }
export function json(value:unknown,status=200,extra:Record<string,string>={}) {return Response.json(value,{status,headers:{'Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff',...extra}});}
export async function route(fn:()=>Promise<Response>){try{return await fn();}catch(e){if(e instanceof HttpError)return json({error:e.message},e.status);console.error('Request failed',e instanceof Error?e.message:'unknown');return json({error:'服务暂时不可用，请稍后重试'},503);}}
export function originCheck(req:Request){const o=req.headers.get('origin');const allowed=[new URL(req.url).origin,env.PUBLIC_ORIGIN].filter(Boolean); if(!o||!allowed.includes(o))throw new HttpError(403,'请从预约页面操作');}
export async function body(req:Request){if(!(req.headers.get('content-type')||'').includes('application/json'))throw new HttpError(415,'请求格式不正确');const t=await req.text();if(t.length>16000)throw new HttpError(413,'填写内容过长');try{const b=JSON.parse(t);if(!b||typeof b!=='object'||Array.isArray(b))throw 0;return b;}catch{throw new HttpError(400,'请求格式不正确');}}
const encoder=new TextEncoder();
export function hex(b:ArrayBuffer|Uint8Array){return Array.from(new Uint8Array(b instanceof Uint8Array?b.buffer as ArrayBuffer:b),v=>v.toString(16).padStart(2,'0')).join('');}
export function random(){return hex(crypto.getRandomValues(new Uint8Array(24)));}
export async function hash(value:string){return hex(await crypto.subtle.digest('SHA-256',encoder.encode(value)));}
async function hmac(value:string){if(!env.SESSION_SECRET)throw new Error('Session secret unavailable'); const k=await crypto.subtle.importKey('raw',encoder.encode(env.SESSION_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',k,encoder.encode(value)));}
export function same(a:string,b:string){let r=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)r|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return r===0;}
export function cookie(req:Request,name:string){return (req.headers.get('cookie')||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(name+'='))?.slice(name.length+1)||'';}
export function cookieHeader(req:Request,name:string,value:string,seconds:number){return `${name}=${value}; Path=/; Max-Age=${seconds}; HttpOnly; SameSite=Strict${new URL(req.url).protocol==='https:'?'; Secure':''}`;}
export async function token(kind:string,id:string,seconds:number){const value=`${kind}.${id}.${Math.floor(Date.now()/1000)+seconds}`;return `${value}.${await hmac(value)}`;}
async function identity(req:Request,kind:string){const parts=cookie(req,kind==='admin'?'room_admin':'room_guest').split('.');if(parts.length!==4||parts[0]!==kind||!/^\d+$/.test(parts[2])||Number(parts[2])<=Date.now()/1000)return null;const value=parts.slice(0,3).join('.');if(!same(await hmac(value),parts[3]))return null;return parts[1];}
export async function guest(req:Request){return await identity(req,'guest');}
export async function requireGuest(req:Request){const id=await guest(req);if(!id)throw new HttpError(401,'浏览器会话已失效，请刷新页面');return hash(id);}
export async function admin(req:Request){return await identity(req,'admin')==='team';}
export async function requireAdmin(req:Request){if(!await admin(req))throw new HttpError(401,'请先登录管理员账号');}
export async function passwordHash(password:string,salt:string){const k=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:encoder.encode(salt),iterations:100000,hash:'SHA-256'},k,256));}
export async function limit(req:Request,kind:string,max:number,seconds=3600,subject?:string){const now=Math.floor(Date.now()/1000);const ip=subject||req.headers.get('cf-connecting-ip')||'unknown';const key=await hash(`${kind}:${ip}:${Math.floor(now/seconds)}`);const row=await db().prepare('INSERT INTO rate_limits (key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key,now+seconds).first<{count:number}>(); if((row?.count||0)>max)throw new HttpError(429,'操作过于频繁，请稍后再试');if(Math.random()<0.02)await db().prepare('DELETE FROM rate_limits WHERE expires < ?').bind(now).run();}
export const publicFields='id,group_id AS groupId,room,date,hour,kind,status,name,student_id AS studentId,class_name AS className,phone,reason,key_status AS keyStatus,created_at AS createdAt';
export function groupRows(rows:Record<string,unknown>[]){const groups=new Map<string,Record<string,unknown>&{hours:number[]}>();for(const row of rows){const id=String(row.groupId||row.id);const found=groups.get(id);if(found)found.hours.push(Number(row.hour));else groups.set(id,{...row,id,hours:[Number(row.hour)]});}return [...groups.values()].map(r=>({...r,hours:r.hours.sort((a,b)=>a-b),hour:Math.min(...r.hours)}));}
