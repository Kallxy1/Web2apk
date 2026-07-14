import type {Metadata} from "next";import {SiteFooter,SiteHeader} from "@/components/site-chrome";
export const metadata:Metadata={title:"FAQ",description:"Pertanyaan umum tentang Web2APK, build APK, source HTML, permission, dan push notification."};
const faq=[
 ["Apa yang bisa diubah menjadi APK?","URL HTTPS, file HTML tunggal, atau ZIP berisi index.html, CSS, JavaScript, dan assets. Source ZIP dapat berjalan offline."],
 ["Apakah source dan APK saya public?","Tidak. Bucket sources dan apks bersifat private. File hanya diakses melalui signed URL dengan masa berlaku terbatas."],
 ["Apakah bisa memakai icon sendiri?","Bisa. Upload icon PNG, JPG, atau WebP berbentuk persegi. Builder akan memasangnya sebagai launcher icon aplikasi."],
 ["Bagaimana push notification bekerja?","Aktifkan push notification dan masukkan OneSignal App ID. Setelah APK terpasang, pesan dapat dikirim melalui dashboard OneSignal."],
 ["Permission apa yang tersedia?","Kamera, mikrofon, lokasi, notifikasi, dan getar. Pilih hanya permission yang benar-benar dibutuhkan aplikasi."],
 ["Apakah APK dapat masuk Google Play?","APK dapat ditandatangani dengan key production. Namun penerimaan tetap mengikuti kebijakan Google Play, termasuk kualitas, privasi, dan nilai guna aplikasi."],
 ["Kenapa build bisa gagal?","Penyebab umum adalah ZIP tidak memiliki index.html, URL bukan HTTPS, signing secret salah, token GitHub kedaluwarsa, atau kuota Actions habis."],
 ["Apakah bisa memakai custom domain?","Bisa. Website utama dirancang untuk web2apk.xystudio.my.id. Tambahkan domain tersebut ke Vercel dan arahkan DNS sesuai instruksi Vercel."],
];
export default function FAQ(){return <main className="mesh min-h-screen"><SiteHeader/><section className="mx-auto max-w-4xl px-5 py-20 sm:px-7"><p className="eyebrow">Bantuan</p><h1 className="mt-4 text-5xl font-black tracking-[-.05em]">Frequently asked questions.</h1><p className="mt-5 text-sm leading-7 text-zinc-500">Jawaban singkat untuk hal yang paling sering ditanyakan.</p><div className="mt-12 divide-y divide-white/[.08] border-y border-white/[.08]">{faq.map(([q,a],i)=><details key={q} className="group"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-6 text-sm font-bold"><span><b className="mr-4 text-zinc-700">{String(i+1).padStart(2,"0")}</b>{q}</span><span className="text-xl font-light text-zinc-600 group-open:rotate-45">+</span></summary><p className="max-w-2xl pb-6 pl-10 text-sm leading-7 text-zinc-500">{a}</p></details>)}</div></section><SiteFooter/></main>}
