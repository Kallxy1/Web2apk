import type {NextConfig} from "next";
const nextConfig:NextConfig={experimental:{serverActions:{bodySizeLimit:"55mb"},optimizePackageImports:["lucide-react","@supabase/supabase-js"]},poweredByHeader:false,compress:true,async rewrites(){return [{source:"/",has:[{type:"host",value:"help.xystudio.my.id"}],destination:"/help"}]},async redirects(){return [{source:"/TOS",destination:"/terms",permanent:true},{source:"/tos",destination:"/terms",permanent:true},{source:"/privacy-policy",destination:"/privacy",permanent:true}]}};
export default nextConfig;
