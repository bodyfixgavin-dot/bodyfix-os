import {NextResponse} from "next/server"; import {getPulseMetrics} from "@/lib/pulse/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(){return NextResponse.json(await getPulseMetrics(),{headers:{"Cache-Control":"no-store"}})}
