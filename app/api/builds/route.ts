import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { dispatchBuild } from "@/lib/github";
const schema=z.object({name:z.string().trim().min(2).max(40),packageName:z.string().regex(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/),mode:z.enum(["url","zip"]),sourceUrl:z.string().optional(),versionName:z.string().regex(/^\d+(\.\d+){0,2}$/),versionCode:z.coerce.number().int().positive(),orientation:z.enum(["portrait","landscape","unspecified"]),themeColor:z.string().regex(/^#[0-9a-fA-F]{6}$/)});
export async function POST(request:Request){
 const sb=await createClient();const {data:{user}}=await sb.auth.getUser();if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 try{const form=await request.formData();const parsed=schema.parse(Object.fromEntries(form.entries()));const admin=createAdminClient();const id=crypto.randomUUID();let sourcePath:string|null=null;let dispatchSource=parsed.sourceUrl||"";
  if(parsed.mode==="url"){const url=new URL(dispatchSource);if(!["http:","https:"].includes(url.protocol))throw new Error("URL harus menggunakan HTTP atau HTTPS");}
  else {const file=form.get("sourceFile");if(!(file instanceof File)||file.size===0)throw new Error("File ZIP wajib dipilih");if(file.size>50*1024*1024)throw new Error("Ukuran ZIP maksimal 50 MB");if(!file.name.toLowerCase().endsWith(".zip"))throw new Error("Source harus berupa file ZIP");sourcePath=`${user.id}/${id}/source.zip`;const {error}=await admin.storage.from("sources").upload(sourcePath,file,{contentType:"application/zip",upsert:false});if(error)throw error;const {data:signed}=await admin.storage.from("sources").createSignedUrl(sourcePath,86400);if(!signed?.signedUrl)throw new Error("Gagal membuat akses source");dispatchSource=signed.signedUrl;}
  const record={id,user_id:user.id,name:parsed.name,package_name:parsed.packageName,mode:parsed.mode,source_url:parsed.mode==="url"?dispatchSource:null,source_path:sourcePath,version_name:parsed.versionName,version_code:parsed.versionCode,orientation:parsed.orientation,theme_color:parsed.themeColor,status:"queued"};
  const {error:insertError}=await admin.from("builds").insert(record);if(insertError)throw insertError;
  try{await dispatchBuild({build_id:id,user_id:user.id,mode:parsed.mode,source:dispatchSource,app_name:parsed.name,package_name:parsed.packageName,version_name:parsed.versionName,version_code:String(parsed.versionCode),orientation:parsed.orientation,theme_color:parsed.themeColor});}
  catch(error){await admin.from("builds").update({status:"failed",error_message:error instanceof Error?error.message:"Dispatch gagal"}).eq("id",id);throw error;}
  return NextResponse.json({id},{status:201});
 }catch(error){if(error instanceof z.ZodError)return NextResponse.json({error:error.issues[0]?.message||"Data tidak valid"},{status:400});return NextResponse.json({error:error instanceof Error?error.message:"Terjadi kesalahan"},{status:400});}
}
