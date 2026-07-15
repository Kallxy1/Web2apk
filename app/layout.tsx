import type {Metadata,Viewport} from "next";
import {Analytics} from "@vercel/analytics/next";
import {SpeedInsights} from "@vercel/speed-insights/next";
import "./globals.css";
const site="https://web2apk.xystudio.my.id";
export const viewport:Viewport={width:"device-width",initialScale:1,maximumScale:1,userScalable:false,themeColor:"#050505",colorScheme:"dark"};
export const metadata:Metadata={
 metadataBase:new URL(site),
 title:{default:"Web2APK — Build Website & HTML Menjadi APK",template:"%s | Web2APK"},
 description:"Build URL website, HTML, CSS, JavaScript, dan ZIP menjadi APK Android. Atur icon, package, permission, push notification, dan versi dalam satu dashboard.",
 keywords:["web to apk","html to apk","website jadi apk","apk builder","android webview","XyStudio"],
 authors:[{name:"KallAntiKecot",url:site}],creator:"KallAntiKecot",publisher:"XyStudio's",
 openGraph:{type:"website",locale:"id_ID",url:site,siteName:"Web2APK by XyStudio's",title:"Web2APK — Dari Web Menjadi Aplikasi Android",description:"APK builder modern untuk URL dan source HTML."},
 twitter:{card:"summary_large_image",title:"Web2APK by XyStudio's",description:"Build website menjadi APK Android."},
 icons:{icon:"/logo.svg",apple:"/logo.svg"},manifest:"/manifest.webmanifest",
 robots:{index:true,follow:true,googleBot:{index:true,follow:true,"max-image-preview":"large","max-snippet":-1}},
};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="id"><body className="noise">{children}<Analytics/><SpeedInsights/></body></html>}
