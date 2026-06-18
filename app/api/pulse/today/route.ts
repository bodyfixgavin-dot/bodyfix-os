import {NextResponse} from "next/server"; import {getPulseMetrics} from "@/lib/pulse/data";
export async function GET(){return NextResponse.json(await getPulseMetrics(),{headers:{"Cache-Control":"public, s-maxage=300, stale-while-revalidate=600"}})}
