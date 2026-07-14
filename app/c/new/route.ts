import {redirect} from "next/navigation";
export async function GET(){const code=crypto.randomUUID().replaceAll("-","").slice(0,14);redirect(`/c/${code}`)}
