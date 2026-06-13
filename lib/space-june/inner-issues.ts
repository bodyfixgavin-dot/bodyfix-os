export type InnerIssueSeverity="low"|"medium"|"high";
export type InnerIssue={id:string;name:string;plainName:string;category:"entrance"|"bathroom"|"bedroom"|"desk"|"living"|"kitchen"|"balcony"|"whole";userQuestion:string;options:{id:string;label:string;score:number}[];traditionalMeaning:string;modernReading:string;suggestedActions:string[];avoidTone:string};
const opts=[{id:"yes",label:"有，而且很明顯",score:2},{id:"some",label:"有一點 / 不確定",score:1},{id:"no",label:"沒有",score:0}];
const issue=(id:string,name:string,category:InnerIssue['category'],userQuestion:string,traditionalMeaning:string,modernReading:string,suggestedActions:string[]):InnerIssue=>({id,name,plainName:name,category,userQuestion,options:opts,traditionalMeaning,modernReading,suggestedActions,avoidTone:"以生活品質與可執行調整為主，不保證吉凶。"});
export const INNER_ISSUES:InnerIssue[]=[
issue("door-bath","開門見廁","entrance","大門一打開，第一眼會不會看到廁所門？","入口氣感容易不穩。","可能帶來潮濕、氣味、隱私與動線不舒服。",["保持廁所乾燥","廁所門保持關閉","玄關保留乾淨焦點"]),
issue("door-stove","開門見灶","entrance","大門一打開，會不會直接看到廚房或爐灶？","傳統認為容易讓財氣外露。","生活區與烹飪區界線可能太模糊。",["保持爐台乾淨","用收納或屏風轉移焦點"]),
issue("door-door","門對門","entrance","入口附近是否有兩扇門正對？","門對門被認為氣場容易衝撞。","可能造成隱私不足與動線尷尬。",["保持門口乾淨","用地毯或植物柔化動線"]),
issue("bath-bed","廁所對床","bedroom","廁所門打開時，是否會直接對到床？","濕氣不宜直衝睡眠區。","潮濕、氣味與聲音可能影響睡眠感受。",["優先調整床位","保持乾燥通風","廁所門關上"]),
issue("mirror-bed","鏡子對床","bedroom","你躺在床上時，會不會看到鏡子反射到自己？","傳統認為容易干擾睡眠。","反射影像可能造成視覺刺激。",["移開鏡子","睡覺時遮住鏡面"]),
issue("beam-bed","床壓樑","bedroom","床的上方是否有明顯樑柱、管線、冷氣或壓迫物？","床上有樑被認為會形成壓迫。","上方壓迫物可能影響安全感與放鬆。",["優先移床","避免頭部正上方壓樑"]),
issue("bed-support","床頭無靠","bedroom","床頭後面是窗戶、門、走道，或不是實牆嗎？","床頭有靠代表穩定。","後方動線可能讓睡眠區缺乏安全感。",["優先靠實牆","使用穩定床頭板"]),
issue("desk-support","書桌背後無靠","desk","你坐在書桌前時，背後是門、窗或主要走道嗎？","座位背後無靠被認為缺乏支持。","背後動線容易干擾專注與安全感。",["優先讓背後靠牆","用矮櫃或植物建立邊界"]),
issue("through-flow","穿堂動線","entrance","大門打開後，視線會不會一路看到窗戶、陽台或後門？","氣容易直進直出。","風、光、聲音與視線過度穿透。",["用地毯、矮櫃或植物緩衝","保留通風但減少直衝感"]),
issue("bath-damp","廁所潮濕壓迫","bedroom","廁所是否很靠近主要活動區，而且容易潮濕或有味道？","濕氣不宜壓迫主要活動區。","潮濕、氣味與清潔壓力會影響居住品質。",["加強除濕與通風","優先檢查漏水與排水"]),
];
export const issuesForArea=(area:string)=>INNER_ISSUES.filter(x=>area==="entrance"?["entrance"].includes(x.category):area==="bedroom"?x.category==="bedroom":area==="desk"?x.category==="desk":false);
