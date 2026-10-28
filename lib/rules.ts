import { APP_CONFIG } from './config';

export const ROOMS = APP_CONFIG.rooms;
export const HOURS = Array.from(
  {length: APP_CONFIG.closingHour - APP_CONFIG.openingHour},
  (_,i)=>APP_CONFIG.openingHour+i,
);
export function chinaNow(now=Date.now()) { return new Date(now+APP_CONFIG.timezoneOffsetHours*3600000); }
export function today(now=Date.now()) { return chinaNow(now).toISOString().slice(0,10); }
export function addDays(day:string,n:number) { return new Date(Date.parse(day+'T00:00:00Z')+n*86400000).toISOString().slice(0,10); }
export function validDate(day:unknown):day is string { return typeof day==='string' && /^\d{4}-\d{2}-\d{2}$/.test(day) && !Number.isNaN(Date.parse(day+'T00:00:00Z')) && new Date(day+'T00:00:00Z').toISOString().slice(0,10)===day; }
export function startTime(day:string,hour:number) { return Date.parse(`${day}T${String(hour).padStart(2,'0')}:00:00+08:00`); }
export function timeLabel(hour:number) { return `${String(hour).padStart(2,'0')}:00–${String(hour+1).padStart(2,'0')}:00`; }
export function formatHours(hours:number[]) { const sorted=[...new Set(hours)].sort((a,b)=>a-b);const groups:number[][]=[];for(const h of sorted){const g=groups[groups.length-1];if(g&&g[g.length-1]+1===h)g.push(h);else groups.push([h]);}return groups.map(g=>`${String(g[0]).padStart(2,'0')}:00–${String(g[g.length-1]+1).padStart(2,'0')}:00`).join('、'); }
export function slotError(room:unknown,day:unknown,hour:unknown,now=Date.now()) {
  if(!ROOMS.some(r=>r.id===room))return '请选择会议室';
  if(!validDate(day)||day<today(now)||day>addDays(today(now),APP_CONFIG.advanceBookingDays))return `仅可预约今天起${APP_CONFIG.advanceBookingDays}天内的日期`;
  if(typeof hour!=='number'||!HOURS.includes(hour))return `请选择${String(APP_CONFIG.openingHour).padStart(2,'0')}:00–${String(APP_CONFIG.closingHour).padStart(2,'0')}:00之间的整点时段`;
  if(startTime(day,hour)<=now)return '该时段已开始，请选择其他时间';
  return null;
}
export function bookingError(b:Record<string,unknown>,now=Date.now()) {
  if(!Array.isArray(b.hours)||b.hours.length===0||b.hours.length>13||new Set(b.hours).size!==b.hours.length)return '请选择1–13个不重复的时段';
  for(const h of b.hours){const slot=slotError(b.room,b.date,h,now);if(slot)return slot;}
  if(typeof b.name!=='string'||!b.name.trim())return '请填写姓名';
  if(typeof b.studentId!=='string'||!b.studentId.trim())return '请填写学号';
  if(typeof b.className!=='string'||!b.className.trim())return '请填写班级';
  if(typeof b.phone!=='string'||!/^1[3-9]\d{9}$/.test(b.phone))return '请填写有效的11位手机号码';
  if(typeof b.reason!=='string'||!b.reason.trim())return '请填写借用理由';
  if(b.consent!==true)return '请先阅读并同意预约须知';
  if(typeof b.requestId!=='string'||!/^[a-f0-9-]{36}$/.test(b.requestId))return '请求无效，请刷新重试';
  return null;
}
