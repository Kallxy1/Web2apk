import {createClient} from "@/lib/supabase/server";
export async function requireAdmin(){const sb=await createClient();const {data:{user}}=await sb.auth.getUser();if(!user)return null;const {data}=await sb.from("profiles").select("role").eq("id",user.id).maybeSingle();return data?.role==="admin"?user:null}
