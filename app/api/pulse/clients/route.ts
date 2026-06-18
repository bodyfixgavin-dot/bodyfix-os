import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
export async function GET(){
 const db=createSupabaseAdminClient(); if(!db) return NextResponse.json({error:"Supabase admin env not configured"},{status:500});
 const [clients, aliases]=await Promise.all([
  db.from("clients").select("id,client_id,client_code,display_name,nickname,client_name").order("display_name").limit(500),
  db.from("client_aliases").select("client_id,alias").limit(1000)
 ]);
 if(clients.error) return NextResponse.json({error:clients.error.message},{status:500});
 if(aliases.error) return NextResponse.json({error:aliases.error.message},{status:500});
 const byClient=new Map<string,string[]>(); (aliases.data??[]).forEach((a:any)=>byClient.set(String(a.client_id),[...(byClient.get(String(a.client_id))??[]),a.alias]));
 return NextResponse.json({clients:(clients.data??[]).map((c:any)=>({...c,id:String(c.id ?? c.client_id),aliases:byClient.get(String(c.id ?? c.client_id))??[]}))});
}
