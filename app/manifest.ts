import type {MetadataRoute} from "next";
export default function manifest():MetadataRoute.Manifest{return {name:"BodyFix Pulse",short_name:"Pulse",description:"BodyFix 老闆每日營運脈搏",start_url:"/",display:"standalone",background_color:"#f3efe6",theme_color:"#142235",icons:[{src:"/icons/pulse-icon.svg",sizes:"any",type:"image/svg+xml",purpose:"any"}]}}
