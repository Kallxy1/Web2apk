import {NextResponse} from "next/server";
export async function GET(){return NextResponse.json({service:"Web2APK API",status:"operational",version:"v1",time:new Date().toISOString()},{headers:{"Cache-Control":"no-store"}})}
