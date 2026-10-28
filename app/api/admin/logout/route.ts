import {route,originCheck,json,cookieHeader} from '@/lib/server';
export async function POST(req:Request){return route(async()=>{originCheck(req);return json({ok:true},200,{'Set-Cookie':cookieHeader(req,'room_admin','',0)});});}
