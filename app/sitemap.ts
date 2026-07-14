import type { MetadataRoute } from "next";
export default function sitemap():MetadataRoute.Sitemap{const base="https://web2apk.xystudio.my.id";return ["","/pricing","/faq","/privacy","/terms","/security","/login","/register"].map((path)=>({url:`${base}${path}`,lastModified:new Date(),changeFrequency:path===""?"weekly":"monthly",priority:path===""?1:.6}))}
