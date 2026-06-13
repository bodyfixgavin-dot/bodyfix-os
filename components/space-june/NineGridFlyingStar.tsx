import styles from "@/app/space-june/SpaceJune.module.css";import { FLYING_STAR_2026,type DirectionId } from "@/lib/space-june/flying-star-2026";
const order:DirectionId[]=["SE","S","SW","E","CENTER","W","NE","N","NW"];
const labels:Record<DirectionId,string>={SE:"喜慶",S:"高注意",SW:"破財",E:"穩定收入",CENTER:"人氣",W:"是非",NE:"學習",N:"貴人",NW:"低刺激"};
export default function NineGridFlyingStar({selected}: {selected?:DirectionId}){return <div className={styles.nineGrid}>{order.map(id=>{const x=FLYING_STAR_2026.sectors[id];return <article key={id} className={`${styles.nineCell} ${id===selected?styles.nineActive:""} ${x.riskLevel==="high"?styles.nineAttention:""}`}><b>{x.direction}</b><em>{labels[id]}</em><small>{x.starName}</small></article>})}</div>}
