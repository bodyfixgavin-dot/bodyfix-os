export type DirectionId="N"|"NE"|"E"|"SE"|"S"|"SW"|"W"|"NW"|"CENTER";
export type RiskLevel="low"|"medium"|"high";
export type FlyingStarSector={id:DirectionId;direction:string;star:number;starName:string;level:"大吉"|"吉"|"凶"|"大凶";traditionalName:string;modernLabel:string;tone:string;advice:string;avoid:string;riskLevel:RiskLevel};
const s=(id:DirectionId,direction:string,star:number,starName:string,level:FlyingStarSector['level'],traditionalName:string,modernLabel:string,tone:string,advice:string,avoid:string,riskLevel:RiskLevel):FlyingStarSector=>({id,direction,star,starName,level,traditionalName,modernLabel,tone,advice,avoid,riskLevel});
export const FLYING_STAR_2026={year:2026,zodiacYear:"丙午馬年",effectiveFrom:"2026-02-04",effectiveBasis:"立春",sectors:{
SE:s("SE","東南",9,"九紫右弼星","大吉","喜慶位","人緣、喜慶、曝光、好消息","增加柔和感與互動感","整理成讓人願意靠近、願意停留的角落。","避免雜物過多或視覺太沉重。","low"),
S:s("S","南",5,"五黃廉貞星","大凶","災煞位","高注意區，宜靜不宜動","今年先保持安靜穩定","不建議施工、敲打或大幅搬動。","避免紅色、強光、噪音、鑽牆與大型變動。","high"),
SW:s("SW","西南",7,"七赤破軍星","凶","破財位","損耗、衝動消費","避免衝動與破損感","先清理破損與過期物品。","避免尖銳物、破損物與雜亂收納。","medium"),
E:s("E","東",8,"八白左輔星","大吉","正財位","正財、事業、穩定收入","適合穩定累積","放與工作、收入、長期規劃有關的物件。","避免堆成雜物區。","low"),
CENTER:s("CENTER","中宮",1,"一白貪狼星","大吉","桃花人緣位","人脈、桃花、溝通、人氣","保持空間核心清爽","保持通風、乾淨與低負擔。","避免堆大型雜物。","low"),
W:s("W","西",3,"三碧祿存星","凶","是非位","口舌、爭執、衝突","降低衝突感","降低噪音、整理線材與視覺刺激。","避免尖銳物、過多紅色與雜亂。","medium"),
NE:s("NE","東北",4,"四綠文曲星","吉","文昌位","學習、考試、創意、策劃","適合學習與整理思緒","適合書桌、閱讀、筆記與規劃。","避免太吵、太亂。","low"),
N:s("N","北",6,"六白武曲星","吉","偏財貴人位","副業、貴人、機會","整理成機會感與行動感的角落","適合工作、副業與重要工具的整理。","避免潮濕、漏水或線材混亂。","low"),
NW:s("NW","西北",2,"二黑巨門星","凶","病符位","健康注意區、低刺激","減少壓力與潮濕","保持乾燥、乾淨、通風與低刺激。","避免潮濕、堆積、霉味。","high")}} as const;
export const getFlyingStarSector=(direction:DirectionId)=>FLYING_STAR_2026.sectors[direction];
