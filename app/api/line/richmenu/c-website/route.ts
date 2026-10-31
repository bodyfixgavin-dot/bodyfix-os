import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const API = "https://api.line.me/v2/bot";
const DATA = "https://api-data.line.me/v2/bot";
const ALIAS = "bodyfix-c";
const TARGET = "https://bodyfix-2-preview.guang11081108.chatgpt.site/home-preview";
function headers(json = false) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) throw new Error("LINE is not configured");
  return { Authorization: "Bearer " + token, ...(json ? {"Content-Type":"application/json"} : {}) };
}
async function read(path:string) {
  const r = await fetch(API + path, {headers:headers(), cache:"no-store"});
  if (!r.ok) throw new Error("LINE read failed: " + r.status);
  return r.json();
}
async function snapshot() {
  const [a,b,c,d] = await Promise.all([
    read("/richmenu/alias/bodyfix-a"), read("/richmenu/alias/bodyfix-b"),
    read("/richmenu/alias/bodyfix-c"), read("/user/all/richmenu")
  ]);
  return {a:a.richMenuId,b:b.richMenuId,c:c.richMenuId,default:d.richMenuId};
}
function websiteIndex(menu:any) {
  const indexes = menu.areas.map((area:any,i:number) => 
    area.action.type === "uri" && /官網|官方網站/.test(area.action.label || "") ? i : -1
  ).filter((i:number)=>i>=0);
  if (indexes.length !== 1) throw new Error("Expected exactly one official website area");
  return indexes[0];
}
function html(text:string) {
  return new Response('<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>C 頁官網網址</title><body style="max-width:720px;margin:40px auto;padding:24px;font:17px/1.8 system-ui;color:#163044;background:#f7f4ed">' + text + '</body></html>', {headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"}});
}
function escape(s:string) {return s.replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));}
export async function GET() {
  if (process.env.VERCEL_ENV === "production") return NextResponse.json({error:"Preview only"},{status:403});
  try {
    const state = await snapshot();
    const menu = await read("/richmenu/" + state.c);
    const old = menu.areas[websiteIndex(menu)].action.uri;
    return html('<h1>只更新 C 頁官網連結</h1><p>目前：' + escape(old) + '</p><p>更新為：' + escape(TARGET) + '</p><p>保留線上 C 圖片、所有其他熱區與動作；A、B、預設選單不變。</p><form method="POST"><input type="hidden" name="expectedId" value="' + escape(state.c) + '"><input type="hidden" name="confirm" value="update-c-website-only"><button style="padding:16px;font-size:18px" type="submit">只更新 C 頁官網連結</button></form>');
  } catch(e) {return NextResponse.json({ok:false,error:e instanceof Error?e.message:"Read failed"},{status:502});}
}
export async function POST(req:Request) {
  if (process.env.VERCEL_ENV === "production") return NextResponse.json({error:"Preview only"},{status:403});
  let created:string|null=null;
  let switched=false;
  try {
    const form = await req.formData();
    if (form.get("confirm") !== "update-c-website-only") throw new Error("Confirmation missing");
    const before = await snapshot();
    if (form.get("expectedId") !== before.c) throw new Error("C changed; refresh before retry");
    const menu = await read("/richmenu/"+before.c);
    const index=websiteIndex(menu);
    const previous=menu.areas[index].action.uri;
    if(previous===TARGET) return html("<h1>官網已是指定網址</h1><p>沒有修改任何選單。</p>");
    const image=await fetch(DATA+"/richmenu/"+before.c+"/content",{headers:headers(),cache:"no-store"});
    if(!image.ok) throw new Error("Cannot read existing C image");
    const bytes=Buffer.from(await image.arrayBuffer());
    const areas=structuredClone(menu.areas);
    areas[index].action.uri=TARGET;
    const create=await fetch(API+"/richmenu",{method:"POST",headers:headers(true),body:JSON.stringify({size:menu.size,selected:menu.selected,name:menu.name,chatBarText:menu.chatBarText,areas})});
    if(!create.ok) throw new Error("C creation failed: "+create.status);
    created=(await create.json()).richMenuId;
    if(!created) throw new Error("Missing C id");
    const upload=await fetch(DATA+"/richmenu/"+created+"/content",{method:"POST",headers:{...headers(),"Content-Type":image.headers.get("content-type")||"image/jpeg"},body:bytes});
    if(!upload.ok) throw new Error("C image copy failed: "+upload.status);
    const verify=await read("/richmenu/"+created);
    if(JSON.stringify(verify.areas)!==JSON.stringify(areas)) throw new Error("New C actions did not match");
    const imageCheck=await fetch(DATA+"/richmenu/"+created+"/content",{headers:headers(),cache:"no-store"});
    if(!imageCheck.ok||!bytes.equals(Buffer.from(await imageCheck.arrayBuffer()))) throw new Error("New C image did not match");
    const current=await snapshot();
    if(JSON.stringify(current)!==JSON.stringify(before)) throw new Error("Menus changed during preparation; stopped");
    const switchRes=await fetch(API+"/richmenu/alias/"+ALIAS,{method:"POST",headers:headers(true),body:JSON.stringify({richMenuId:created})});
    if(!switchRes.ok) throw new Error("C alias update failed: "+switchRes.status);
    switched=true;
    const after=await snapshot();
    if(after.c!==created||after.a!==before.a||after.b!==before.b||after.default!==before.default) throw new Error("Post-update verification failed");
    return html("<h1>C 頁官網已更新 ✅</h1><p>新網址："+escape(TARGET)+"</p><p>原網址："+escape(previous)+"</p><p>C 圖片逐位元相同；其他熱區與動作相同；A、B 及預設選單查核相同。</p><pre>"+escape(JSON.stringify({before,after},null,2))+"</pre>");
  } catch(e) {
    // Keep a menu that may already be referenced; never delete after a switch attempt.
    if(created&&!switched) {try{await fetch(API+"/richmenu/"+created,{method:"DELETE",headers:headers()});}catch{}}
    return NextResponse.json({ok:false,error:e instanceof Error?e.message:"Update failed",createdId:created,aliasSwitched:switched},{status:502});
  }
}
