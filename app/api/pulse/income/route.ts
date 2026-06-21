import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
export async function POST(req:Request){
 const db=createSupabaseAdminClient(); if(!db) return NextResponse.json({error:"Supabase admin env not configured"},{status:500});
 const body=await req.json(); const client=body.client; const service=body.service;
 if(!client?.id || !service?.service_code) return NextResponse.json({error:"請選擇正式客戶與服務"},{status:400});
 const payload={entry_date:body.date,client_id:client.id,client_name_snapshot:client.display_name||client.nickname||client.client_name||client.id,service_code:service.service_code,service_line:service.service_line,service_name:service.service_name,service_variant:service.service_variant,standard_price:Number(service.price),amount_actual:Number(body.amount_actual),source:body.source,note:body.note};
 const {data,error}=await db.from("pulse_income_entries").insert(payload).select("*").single();
 if(error) return NextResponse.json({error:error.message},{status:500}); return NextResponse.json({entry:data});
}
