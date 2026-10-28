import {db,route,originCheck,json,body,requireGuest,publicFields,limit,HttpError,hash,random,groupRows} from '@/lib/server';
import {bookingError} from '@/lib/rules';
export async function GET(req:Request){return route(async()=>{const owner=await requireGuest(req);const r=await db().prepare(`SELECT ${publicFields} FROM reservations WHERE guest_hash=? AND kind='booking' ORDER BY date DESC,hour DESC LIMIT 4000`).bind(owner).all();return json({bookings:groupRows(r.results)});});}
export async function POST(req:Request){return route(async()=>{originCheck(req);const owner=await requireGuest(req);const b=await body(req);const error=bookingError(b);if(error)throw new HttpError(400,error);await limit(req,'booking',30,3600,owner);await limit(req,'booking-ip',200);
  const findExisting=async()=>{const r=await db().prepare(`SELECT ${publicFields} FROM reservations WHERE group_id=? AND guest_hash=? ORDER BY hour`).bind(b.requestId,owner).all();return groupRows(r.results)[0];};
  const existing=await findExisting();if(existing)return json({booking:existing,replayed:true});
  const hours=(b.hours as number[]).slice().sort((a,b)=>a-b);const code=random().slice(0,32).toUpperCase();const receiptHash=await hash(code);const now=Date.now();
  const statements=hours.map((hour,i)=>db().prepare('INSERT INTO reservations (id,group_id,room,date,hour,kind,status,name,student_id,class_name,phone,reason,guest_hash,receipt_hash,request_id,key_status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),b.requestId,b.room,b.date,hour,'booking','active',b.name.trim(),b.studentId.trim(),b.className.trim(),b.phone,b.reason.trim(),owner,i===0?receiptHash:null,`${b.requestId}:${hour}`,'uncollected',now,now));
  try{await db().batch(statements);}catch(e){if(String(e).includes('UNIQUE constraint')){const replay=await findExisting();if(replay)return json({booking:replay,replayed:true});throw new HttpError(409,'所选时段中有时段刚被预约或暂停，本次预约未提交，请重新选择');}throw e;}
  return json({booking:await findExisting(),receipt:code},201);
});}
