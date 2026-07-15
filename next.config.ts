import type {NextConfig} from "next";
const helpHost={type:"host" as const,value:"help.xystudio.my.id"};const apiHost={type:"host" as const,value:"api.xystudio.my.id"};
const helpSlugs="getting-started|guides|build-apk|html-format|permissions|push-notification|storage|signing|update-app|troubleshooting|changelog|status|contact|api-docs|acceptable-use|refund-policy|dmca|service-level";
const nextConfig:NextConfig={experimental:{serverActions:{bodySizeLimit:"55mb"},optimizePackageImports:["lucide-react","@supabase/supabase-js"]},poweredByHeader:false,compress:true,async rewrites(){return [
 {source:"/",has:[helpHost],destination:"/help"},
 {source:`/:slug(${helpSlugs})`,has:[helpHost],destination:"/help/:slug"},
 {source:"/",has:[apiHost],destination:"/api/health"},
 {source:"/download/:path*",has:[apiHost],destination:"/api/download/:path*"},
 {source:"/webhooks/:path*",has:[apiHost],destination:"/api/webhooks/:path*"},
 ]},async redirects(){return [{source:"/TOS",destination:"/terms",permanent:true},{source:"/tos",destination:"/terms",permanent:true},{source:"/privacy-policy",destination:"/privacy",permanent:true}]}};
export default nextConfig;
