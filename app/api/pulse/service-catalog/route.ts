import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
export async function GET(){
 const db=createSupabaseAdminClient(); if(!db) return NextResponse.json({error:"Supabase admin env not configured"},{status:500});
 const {data,error}=await db.from("service_catalog").select("service_code,service_line,service_name,service_variant,standard_price,price,status").in("status",["active","trial"]).order("service_code");
 if(error) return NextResponse.json({error:error.message},{status:500});
 return NextResponse.json({services:(data??[]).map((s:any)=>({...s,price:Number(s.standard_price ?? s.price ?? 0)}))});
}
