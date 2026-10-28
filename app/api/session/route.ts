import {route,originCheck,json,guest,random,token,cookieHeader} from '@/lib/server';
export async function POST(req:Request){return route(async()=>{originCheck(req);const id=await guest(req)||random();return json({ok:true},200,{'Set-Cookie':cookieHeader(req,'room_guest',await token('guest',id,15552000),15552000)});});}
