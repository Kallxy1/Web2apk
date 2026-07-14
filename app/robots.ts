import type { MetadataRoute } from "next";
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:"*",allow:"/",disallow:["/dashboard/","/api/"]},sitemap:"https://web2apk.xystudio.my.id/sitemap.xml",host:"https://web2apk.xystudio.my.id"}}
