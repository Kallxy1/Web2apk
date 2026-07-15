import {NextResponse} from "next/server";
export async function GET(request:Request){const url=new URL(request.url),code=crypto.randomUUID().replaceAll("-","").slice(0,14),target=new URL(`/c/${code}`,url.origin),update=url.searchParams.get("update");if(update&&/^[0-9a-f-]{36}$/i.test(update))target.searchParams.set("update",update);return NextResponse.redirect(target)}
