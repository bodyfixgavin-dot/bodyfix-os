import { createHash } from "crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const LINE_API_BASE = "https://api.line.me/v2/bot";
const LINE_DATA_API_BASE = "https://api-data.line.me/v2/bot";
const WIDTH = 2500;
const HEIGHT = 1686;

function isProduction() {
  return process.env.VERCEL_ENV === "production";
}

function getLineToken() {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not configured");
  return token;
}

function lineHeaders(extra?: Record<string,string>) {
  return {
    Authorization: "Bearer " + getLineToken(),
    ...extra
  };
}

async function readLineResponse(res: Response) {
  const text = await res.text();
  if (!text) return {};
  try { return JSON.parse(text); } catch { return { raw:text }; }
}

function richMenuSwitch(bounds: any, label: string, alias: string) {
  return {
    bounds,
    action: {
      type: "richmenuswitch",
      label,
      richMenuAliasId: alias,
      data: "richmenu=" + alias
    }
  };
}

function postback(
  bounds: any,
  label: string,
  data: string,
  displayText: string
) {
  return {
    bounds,
    action: {
      type: "postback",
      label,
      data,
      displayText
    }
  };
}

function uri(bounds: any, label: string, target: string) {
  return {
    bounds,
    action: {
      type: "uri",
      label,
      uri: target
    }
  };
}

const TAB_A = { x: 0, y: 0, width: 833, height: 165 };
const TAB_B = { x: 833, y: 0, width: 834, height: 165 };
const TAB_C = { x: 1667, y: 0, width: 833, height: 165 };

const MENU_CONFIGS = [
  {
    key: "a",
    field: "imageA",
    alias: "bodyfix-a",
    name: "BodyFix A｜服務・價格",
    areas: [
      richMenuSwitch(TAB_B, "預約・據點", "bodyfix-b"),
      richMenuSwitch(TAB_C, "更多", "bodyfix-c"),
      postback(
        { x: 30, y: 490, width: 850, height: 820 },
        "Body Reset",
        "action=service&service=body-reset",
        "我想了解筋膜整理系列"
      ),
      postback(
        { x: 890, y: 490, width: 800, height: 420 },
        "骨盆核心整理",
        "action=service&service=pelvic-core",
        "我想了解骨盆核心整理"
      ),
      postback(
        { x: 890, y: 910, width: 800, height: 400 },
        "VIP 骨盆核心深層",
        "action=service&service=vip-pelvic",
        "我想了解 VIP 骨盆核心深層整理"
      ),
      postback(
        { x: 1700, y: 490, width: 770, height: 600 },
        "1 對 1 教練課",
        "action=service&service=personal-training",
        "我想了解 1 對 1 教練課"
      ),
      postback(
        { x: 1700, y: 1090, width: 770, height: 220 },
        "教練課方案",
        "action=service&service=training-plans",
        "我想看教練課方案"
      ),
      postback(
        { x: 550, y: 1345, width: 780, height: 200 },
        "紫微斗數解析",
        "action=service&service=ziwei",
        "我想了解紫微斗數解析"
      ),
      postback(
        { x: 1330, y: 1345, width: 700, height: 200 },
        "塔羅占卜",
        "action=service&service=tarot",
        "我想了解塔羅占卜"
      ),
      richMenuSwitch(
        { x: 2030, y: 1345, width: 440, height: 200 },
        "更多詳細選項",
        "bodyfix-c"
      )
    ]
  },
{
  "key": "b",
  "field": "imageB",
  "alias": "bodyfix-b",
  "name": "BodyFix B｜固定時段 20261116",
  "areas": [
    {
      "bounds": {
        "x": 0,
        "y": 0,
        "width": 833,
        "height": 165
      },
      "action": {
        "type": "richmenuswitch",
        "label": "服務・價格",
        "richMenuAliasId": "bodyfix-a",
        "data": "richmenu=bodyfix-a"
      }
    },
    {
      "bounds": {
        "x": 1667,
        "y": 0,
        "width": 833,
        "height": 165
      },
      "action": {
        "type": "richmenuswitch",
        "label": "更多",
        "richMenuAliasId": "bodyfix-c",
        "data": "richmenu=bodyfix-c"
      }
    },
    {
      "bounds": {
        "x": 1010,
        "y": 450,
        "width": 650,
        "height": 255
      },
      "action": {
        "type": "postback",
        "label": "詢問 14:00",
        "data": "action=booking-draft",
        "inputOption": "openKeyboard",
        "fillInText": "想預約的服務：\n日期：\n時段：14:00\n地點："
      }
    },
    {
      "bounds": {
        "x": 1700,
        "y": 450,
        "width": 650,
        "height": 255
      },
      "action": {
        "type": "postback",
        "label": "詢問 17:00",
        "data": "action=booking-draft",
        "inputOption": "openKeyboard",
        "fillInText": "想預約的服務：\n日期：\n時段：17:00\n地點："
      }
    },
    {
      "bounds": {
        "x": 1010,
        "y": 720,
        "width": 650,
        "height": 265
      },
      "action": {
        "type": "postback",
        "label": "詢問 19:00",
        "data": "action=booking-draft",
        "inputOption": "openKeyboard",
        "fillInText": "想預約的服務：\n日期：\n時段：19:00\n地點："
      }
    },
    {
      "bounds": {
        "x": 1700,
        "y": 720,
        "width": 650,
        "height": 265
      },
      "action": {
        "type": "postback",
        "label": "詢問 22:00",
        "data": "action=booking-draft",
        "inputOption": "openKeyboard",
        "fillInText": "想預約的服務：\n日期：\n時段：22:00\n地點："
      }
    },
    {
      "bounds": {
        "x": 1000,
        "y": 1000,
        "width": 1380,
        "height": 140
      },
      "action": {
        "type": "postback",
        "label": "詢問其他時間",
        "data": "action=booking-draft",
        "inputOption": "openKeyboard",
        "fillInText": "想預約的服務：\n日期：\n時段：\n地點："
      }
    },
    {
      "bounds": {
        "x": 45,
        "y": 1420,
        "width": 2410,
        "height": 175
      },
      "action": {
        "type": "postback",
        "label": "私訊預約",
        "data": "action=booking-draft",
        "inputOption": "openKeyboard",
        "fillInText": "想預約的服務：\n日期：\n時段：\n地點："
      }
    },
    {
      "bounds": {
        "x": 80,
        "y": 335,
        "width": 795,
        "height": 1070
      },
      "action": {
        "type": "postback",
        "label": "信義區・六張犁工作室",
        "data": "action=location&location=luzhangli",
        "displayText": "我想了解信義區・六張犁工作室"
      }
    },
    {
      "bounds": {
        "x": 1445,
        "y": 1180,
        "width": 195,
        "height": 110
      },
      "action": {
        "type": "postback",
        "label": "西門",
        "data": "action=location&location=ximen",
        "displayText": "我想了解西門"
      }
    },
    {
      "bounds": {
        "x": 1665,
        "y": 1180,
        "width": 365,
        "height": 110
      },
      "action": {
        "type": "postback",
        "label": "國父紀念館",
        "data": "action=location&location=sunyatsen",
        "displayText": "我想了解國父紀念館"
      }
    },
    {
      "bounds": {
        "x": 2050,
        "y": 1180,
        "width": 365,
        "height": 110
      },
      "action": {
        "type": "postback",
        "label": "指定地點",
        "data": "action=location&location=custom",
        "displayText": "我想了解指定地點"
      }
    }
  ]
},
  {
    key: "c",
    field: "imageC",
    alias: "bodyfix-c",
    name: "BodyFix C｜更多",
    areas: [
      richMenuSwitch(TAB_A, "服務・價格", "bodyfix-a"),
      richMenuSwitch(TAB_B, "預約・據點", "bodyfix-b"),
      postback(
        { x: 820, y: 500, width: 840, height: 390 },
        "認識 Gavin",
        "action=content&content=gavin",
        "我想認識 Gavin"
      ),
      postback(
        { x: 1680, y: 500, width: 790, height: 390 },
        "第一次來",
        "action=content&content=first-visit",
        "我想看第一次來流程"
      ),
      postback(
        { x: 820, y: 900, width: 760, height: 370 },
        "FAQ",
        "action=content&content=faq",
        "我想看常見問題"
      ),
      postback(
        { x: 1590, y: 900, width: 880, height: 370 },
        "4R Method",
        "action=content&content=4r",
        "我想了解 4R Method"
      ),
      postback(
        { x: 820, y: 1280, width: 830, height: 300 },
        "BodyFix 是什麼",
        "action=content&content=about-bodyfix",
        "我想了解 BodyFix 是什麼"
      ),
      uri(
        { x: 1660, y: 1280, width: 400, height: 300 },
        "IG / 作品",
        "https://www.instagram.com/bodyfixgavin/"
      ),
      uri(
        { x: 2070, y: 1280, width: 400, height: 300 },
        "官方網站",
        "https://bodyfix-os.vercel.app/"
      )
    ]
  }
];



function page(content:string) {
  return new Response(
    [
      "<!doctype html>",
      '<html lang="zh-Hant">',
      "<head>",
      '<meta charset="utf-8" />',
      '<meta name="viewport" content="width=device-width, initial-scale=1" />',
      "<title>BodyFix Rich Menu Admin</title>",
      "<style>",
      "*{box-sizing:border-box}",
      "body{margin:0;padding:32px 16px;background:#071d2d;color:#f5ead8;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}",
      ".wrap{max-width:860px;margin:0 auto}",
      ".hero,.card{background:#0b263a;border:1px solid #b98b4c;border-radius:18px}",
      ".hero{padding:26px;margin-bottom:18px}",
      ".grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}",
      ".card{padding:20px}",
      "h1{margin:0 0 8px;color:#e8bd78}",
      "h2{margin:0 0 8px;font-size:20px;color:#f5ead8}",
      "p{line-height:1.65;margin:8px 0}",
      ".tag{display:inline-block;border:1px solid #b98b4c;border-radius:999px;padding:5px 9px;font-size:12px;color:#e8bd78;margin-bottom:10px}",
      ".note{font-size:13px;opacity:.8}",
      ".ok,.warn{padding:14px;border-radius:12px;margin:14px 0}",
      ".ok{border:1px solid #b98b4c;background:rgba(232,189,120,.10)}",
      ".warn{border:1px solid #c77465;background:rgba(199,116,101,.08)}",
      "input[type=file]{width:100%;margin:14px 0;color:#f5ead8}",
      "button{width:100%;padding:12px 14px;border:0;border-radius:999px;background:#e8bd78;color:#071d2d;font-weight:800;font-size:15px;cursor:pointer}",
      "code{color:#e8bd78;word-break:break-all}",
      "@media(max-width:760px){.grid{grid-template-columns:1fr}}",
      "</style>",
      "</head><body><div class=\"wrap\">",
      content,
      "</div></body></html>"
    ].join(""),
    {headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"}}
  );
}

function validateImage(value:any) {
  if (!(value instanceof File)) throw new Error("請選擇圖片。");
  if (!["image/png","image/jpeg"].includes(value.type)) throw new Error("圖片必須是 PNG 或 JPEG。");
  if (value.size > 1_000_000) throw new Error("圖片超過 1 MB，請先壓縮。");
  return value;
}

async function createRichMenu(config:any,image:File) {
  const createRes=await fetch(LINE_API_BASE+"/richmenu",{
    method:"POST",
    headers:lineHeaders({"Content-Type":"application/json"}),
    body:JSON.stringify({
      size:{width:WIDTH,height:HEIGHT},
      selected:true,
      name:config.name,
      chatBarText:"BodyFix 選單",
      areas:config.areas
    })
  });
  if(!createRes.ok) throw new Error(config.alias+" 建立失敗："+JSON.stringify(await readLineResponse(createRes)));
  const data:any=await readLineResponse(createRes);
  const richMenuId=data.richMenuId;
  if(!richMenuId) throw new Error(config.alias+" 未取得 richMenuId");

  const uploadRes=await fetch(LINE_DATA_API_BASE+"/richmenu/"+richMenuId+"/content",{
    method:"POST",
    headers:lineHeaders({"Content-Type":image.type}),
    body:Buffer.from(await image.arrayBuffer())
  });
  if(!uploadRes.ok){
    const err=await readLineResponse(uploadRes);
    await fetch(LINE_API_BASE+"/richmenu/"+richMenuId,{method:"DELETE",headers:lineHeaders()});
    throw new Error(config.alias+" 圖片上傳失敗："+JSON.stringify(err));
  }
  return richMenuId;
}

async function upsertAlias(alias:string,richMenuId:string){
  const lookup=await fetch(LINE_API_BASE+"/richmenu/alias/"+encodeURIComponent(alias),{headers:lineHeaders()});
  if(lookup.ok){
    const update=await fetch(LINE_API_BASE+"/richmenu/alias/"+encodeURIComponent(alias),{
      method:"POST",
      headers:lineHeaders({"Content-Type":"application/json"}),
      body:JSON.stringify({richMenuId})
    });
    if(!update.ok) throw new Error(alias+" Alias 更新失敗："+JSON.stringify(await readLineResponse(update)));
    return;
  }
  if(lookup.status!==404) throw new Error(alias+" Alias 查詢失敗："+JSON.stringify(await readLineResponse(lookup)));
  const create=await fetch(LINE_API_BASE+"/richmenu/alias",{
    method:"POST",
    headers:lineHeaders({"Content-Type":"application/json"}),
    body:JSON.stringify({richMenuAliasId:alias,richMenuId})
  });
  if(!create.ok) throw new Error(alias+" Alias 建立失敗："+JSON.stringify(await readLineResponse(create)));
}

async function setDefault(richMenuId:string){
  const res=await fetch(LINE_API_BASE+"/user/all/richmenu/"+encodeURIComponent(richMenuId),{
    method:"POST",headers:lineHeaders()
  });
  if(!res.ok) throw new Error("A 設為預設失敗："+JSON.stringify(await readLineResponse(res)));
}

function formCard(key:string,title:string,desc:string,defaultNote:string){
  return [
    '<div class="card">',
    '<span class="tag">'+title+'</span>',
    '<h2>'+title+'</h2>',
    '<p>'+desc+'</p>',
    '<p class="note">'+defaultNote+'</p>',
    '<form method="POST" enctype="multipart/form-data">',
    '<input type="hidden" name="menuKey" value="'+key+'" />',
    '<input type="file" name="image" accept="image/png,image/jpeg" required />',
    '<button type="submit">替換 '+title+' 圖片</button>',
    '</form>',
    '</div>'
  ].join("");
}

export async function GET(req: Request){
  if (!isProduction() && new URL(req.url).searchParams.get("status") === "b") {
    const res = await fetch(LINE_API_BASE+"/richmenu/alias/bodyfix-b",{headers:lineHeaders(),cache:"no-store"});
    const alias = await readLineResponse(res);
    if (!res.ok) return NextResponse.json({ok:false}, {status:502});
    const menu = await fetch(LINE_API_BASE+"/richmenu/"+alias.richMenuId,{headers:lineHeaders(),cache:"no-store"});
    return NextResponse.json({alias,menu:await readLineResponse(menu)});
  }
  if(isProduction()){
    return page('<div class="hero"><h1>BodyFix Rich Menu Admin</h1><div class="warn">此管理工具目前只開放 Preview 環境。</div></div>');
  }
  return page(
    '<div class="hero">'+
    '<h1>BodyFix Rich Menu Admin</h1>'+
    '<p>固定管理 A / B / C。每次更新都會沿用既有熱區與 action，只替換背景圖並更新 Alias。</p>'+
    '<div class="ok">尺寸固定 <strong>2500 × 1686</strong>｜PNG/JPG｜1 MB 內</div>'+
    '<p class="note">A 更新後會自動重新設為所有好友預設首頁；B / C 只更新各自 Alias，不會改動其他頁。</p>'+
    '</div>'+
    '<div class="grid">'+
    formCard("a","A｜服務・價格","更新服務、價格或首頁品牌視覺。","保留 A 熱區；更新後自動設為預設首頁。")+
    formCard("b","B｜預約・據點","更新據點、預約入口或位置資訊。","保留 B 熱區；A / C 完全不動。")+
    formCard("c","C｜更多","更新 Gavin、FAQ、4R、網站等入口視覺。","保留 C 熱區；A / B 完全不動。")+
    '</div>'
  );
}

export async function POST(req:Request){
  if(isProduction()){
    return NextResponse.json({ok:false,error:"Disabled in production"},{status:403});
  }

  let createdId:string|null=null;
  let aliasAttempted=false;
  let previousId="";
  try{
    const form=await req.formData();
    const menuKey=String(form.get("menuKey")||"");
    if(menuKey!=="b") throw new Error("本次只允許更新 B 頁");
    const config=MENU_CONFIGS.find((item:any)=>item.key===menuKey);
    if(!config) throw new Error("未知的 Rich Menu 頁面。");
    const image=validateImage(form.get("image"));

    const hash=createHash("sha256").update(Buffer.from(await image.arrayBuffer())).digest("hex");
    if(hash!=="6f662a7d381dd9954a2a0c0b31f00b9faa2457f11179271f1bb442eb6e47e042") throw new Error("請使用本次核准的 B 圖片");
    const previous=await fetch(LINE_API_BASE+"/richmenu/alias/bodyfix-b",{headers:lineHeaders(),cache:"no-store"});
    if(!previous.ok) throw new Error("無法確認現有 B 頁");
    previousId=(await readLineResponse(previous)).richMenuId;
    const current=await fetch(LINE_API_BASE+"/richmenu/"+previousId,{headers:lineHeaders(),cache:"no-store"});
    if(!current.ok) throw new Error("無法讀取現有 B 頁");
    const currentMenu=await readLineResponse(current);
    if(currentMenu.name===config.name && JSON.stringify(currentMenu.areas)===JSON.stringify(config.areas)) return page("<h1>B 頁已是本次版本</h1><p>"+previousId+"</p>");
    const check=await fetch(LINE_API_BASE+"/richmenu/validate",{method:"POST",headers:lineHeaders({"Content-Type":"application/json"}),body:JSON.stringify({size:{width:WIDTH,height:HEIGHT},selected:true,name:config.name,chatBarText:"BodyFix 選單",areas:config.areas})});
    if(!check.ok) throw new Error("LINE 熱區驗證失敗："+JSON.stringify(await readLineResponse(check)));
    createdId=await createRichMenu(config,image);
    aliasAttempted=true;
    await upsertAlias(config.alias,createdId);
    if(menuKey==="a") await setDefault(createdId);

    return page(
      '<div class="hero">'+
      '<h1>更新完成 ✅</h1>'+
      '<div class="ok"><strong>'+config.name+'</strong><br>Alias：<code>'+config.alias+'</code><br>Rich Menu ID：<code>'+createdId+'</code></div>'+
      '<p>其他兩頁沒有修改；B 熱區已對齊新版，預約按鈕會開啟可編輯訊息草稿。</p>'+ '<p>舊 B ID（保留供復原）：'+previousId+'</p>'+
      '<p><a href="/api/line/richmenu/manage" style="color:#e8bd78">← 回管理頁</a></p>'+
      '</div>'
    );
  }catch(error){
    if(createdId && !aliasAttempted){
      try{await fetch(LINE_API_BASE+"/richmenu/"+createdId,{method:"DELETE",headers:lineHeaders()});}catch{}
    }
    return page(
      '<div class="hero"><h1>更新失敗</h1><div class="warn">'+
      (error instanceof Error?error.message:String(error))+
      '</div><p><a href="/api/line/richmenu/manage" style="color:#e8bd78">← 回管理頁</a></p></div>'
    );
  }
}
