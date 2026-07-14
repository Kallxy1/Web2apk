import type {NextConfig} from "next";
const nextConfig:NextConfig={experimental:{serverActions:{bodySizeLimit:"55mb"}},poweredByHeader:false,compress:true,async redirects(){return [{source:"/TOS",destination:"/terms",permanent:true},{source:"/tos",destination:"/terms",permanent:true},{source:"/privacy-policy",destination:"/privacy",permanent:true}]}};
export default nextConfig;
