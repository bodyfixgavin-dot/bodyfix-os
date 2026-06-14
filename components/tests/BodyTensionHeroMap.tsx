export type BodyTensionMapType = "sedentary" | "stress" | "training" | "pelvic";

type MapConfig = { label: string; zones: string[] };
const maps: Record<BodyTensionMapType, MapConfig> = {
  sedentary: { label: "久坐型", zones: ["肩頸", "上背", "髖部", "下背"] },
  stress: { label: "壓力型", zones: ["肩頸", "胸口", "呼吸", "腹部"] },
  training: { label: "訓練恢復型", zones: ["肩胛", "髖部", "大腿", "腿後側"] },
  pelvic: { label: "骨盆核心代償型", zones: ["骨盆", "核心", "下背", "髖部"] },
};

function HotZones({ type }: { type: BodyTensionMapType }) {
  if (type === "stress") return <><ellipse className="map-glow" cx="100" cy="61" rx="35" ry="10"/><ellipse className="map-glow" cx="100" cy="89" rx="30" ry="17"/><path className="map-band" d="M70 108q30 12 60 0"/><ellipse className="map-glow soft" cx="100" cy="126" rx="25" ry="21"/></>;
  if (type === "sedentary") return <><path className="map-band" d="M65 58q35-13 70 3M72 72q28 20 56 0"/><ellipse className="map-glow soft" cx="100" cy="119" rx="30" ry="18"/><ellipse className="map-glow" cx="100" cy="145" rx="27" ry="15"/></>;
  if (type === "training") return <><ellipse className="map-glow" cx="70" cy="80" rx="16" ry="22"/><ellipse className="map-glow" cx="130" cy="80" rx="16" ry="22"/><ellipse className="map-glow soft" cx="100" cy="145" rx="31" ry="17"/><path className="map-band" d="M78 154l-12 57M122 154l12 57"/><path className="map-band dashed" d="M84 155l-9 59M116 155l9 59"/></>;
  return <><ellipse className="map-glow" cx="100" cy="143" rx="39" ry="23"/><ellipse className="map-core" cx="100" cy="119" rx="20" ry="31"/><path className="map-band" d="M72 137q24 20 56-3"/><ellipse className="map-glow soft" cx="77" cy="158" rx="14" ry="12"/><ellipse className="map-glow" cx="126" cy="154" rx="14" ry="12"/></>;
}

export default function BodyTensionHeroMap({ type, secondaryType }: { type: BodyTensionMapType; secondaryType?: BodyTensionMapType }) {
  const primary = maps[type];
  const zones = secondaryType ? [...primary.zones.slice(0, 2), ...maps[secondaryType].zones.slice(0, 2)] : primary.zones;
  return <div className={`tension-visual map-${type}`} aria-label={`${primary.label}身體張力地圖`}>
    <div className="visual-label"><span>BODY MAP</span><b>{primary.label}</b></div>
    {secondaryType && <div className="map-secondary-badge">+ {maps[secondaryType].label}</div>}
    <svg viewBox="0 0 200 250" role="img" aria-label={`${primary.label}主要張力熱區`}>
      <defs><radialGradient id={`glow-${type}`}><stop offset="0" stopColor="#d4af7a" stopOpacity=".62"/><stop offset="1" stopColor="#d4af7a" stopOpacity="0"/></radialGradient><filter id={`blur-${type}`}><feGaussianBlur stdDeviation="5"/></filter></defs>
      <g className="map-hot-zones" style={{fill:`url(#glow-${type})`}}><HotZones type={type}/></g>
      <g className="map-anatomy">
        <ellipse cx="100" cy="27" rx="16" ry="20"/><path d="M91 46l-5 13m23-13 5 13M86 58q14 9 28 0M86 59Q65 66 57 86l-13 56m70-83q21 7 29 27l13 56M76 69q24-13 48 0l7 54q-3 19-31 29-28-10-31-29z"/><path d="M76 84q24 13 48 0M72 106q28 13 56 0M69 123q31 14 62 0M78 145q22 12 44 0M84 151l-9 82m41-82 9 82M75 233h-12m62 0h12"/><path className="map-detail" d="M100 62v84M84 72q16 9 32 0M81 92q19 12 38 0M84 114q16 10 32 0M86 135q14 8 28 0"/>
      </g>
    </svg>
    <div className="visual-zones">{zones.map((zone, index)=><span key={`${zone}-${index}`}>{zone}</span>)}</div>
  </div>;
}
