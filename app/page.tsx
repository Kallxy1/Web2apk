import Link from "next/link";
import { ArrowRight, Box, CheckCircle2, Code2, Github, Globe2, ShieldCheck, Smartphone, UploadCloud, Zap } from "lucide-react";
import { Logo } from "@/components/logo";
const features = [
  [Globe2,"URL ke APK","Bungkus website online Anda menjadi aplikasi Android WebView."],
  [Code2,"HTML ke APK","Upload ZIP berisi HTML, CSS, dan JavaScript untuk aplikasi offline."],
  [Github,"Build otomatis","GitHub Actions menjalankan Android build secara aman dan terisolasi."],
  [ShieldCheck,"Aman per pengguna","Auth, Row Level Security, dan private storage dari Supabase."],
  [Zap,"Proses transparan","Pantau status queued, building, selesai, atau gagal dari dashboard."],
  [Box,"APK siap instal","File hasil build tersimpan privat dan tersedia melalui signed download URL."],
];
export default function Home() {
 return <main className="grid-bg min-h-screen">
  <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6"><Logo/><div className="flex items-center gap-3"><Link href="/login" className="btn-secondary py-2.5">Masuk</Link><Link href="/register" className="btn-primary py-2.5">Mulai gratis</Link></div></nav>
  <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 pb-24 pt-20 lg:grid-cols-[1.1fr_.9fr] lg:pt-28">
   <div><span className="inline-flex items-center gap-2 rounded-full border border-cyan/20 bg-cyan/5 px-3 py-1.5 text-xs font-semibold text-cyan"><Zap size={13}/> Android builder, tanpa ribet</span>
    <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[1.06] tracking-[-.045em] sm:text-7xl">Website kamu.<br/><span className="bg-gradient-to-r from-cyan to-violet bg-clip-text text-transparent">Sekarang jadi APK.</span></h1>
    <p className="mt-7 max-w-xl text-lg leading-8 text-slate-400">Ubah URL atau project HTML menjadi aplikasi Android. Atur nama, package, orientasi, lalu biarkan cloud builder menyelesaikannya.</p>
    <div className="mt-9 flex flex-wrap gap-3"><Link href="/register" className="btn-primary">Buat APK pertama <ArrowRight size={17}/></Link><a href="#fitur" className="btn-secondary">Lihat fitur</a></div>
    <div className="mt-8 flex flex-wrap gap-5 text-xs text-slate-500">{["Tanpa kartu kredit","Project privat","Build log otomatis"].map(x=><span className="flex items-center gap-1.5" key={x}><CheckCircle2 size={14} className="text-cyan"/>{x}</span>)}</div>
   </div>
   <div className="relative mx-auto w-full max-w-lg"><div className="absolute -inset-10 rounded-full bg-cyan/10 blur-3xl"/><div className="card relative overflow-hidden p-3 shadow-2xl"><div className="flex items-center gap-2 border-b border-white/10 px-3 py-3"><i className="h-2.5 w-2.5 rounded-full bg-red-400"/><i className="h-2.5 w-2.5 rounded-full bg-amber-400"/><i className="h-2.5 w-2.5 rounded-full bg-emerald-400"/><span className="ml-3 text-[11px] text-slate-600">app.web2apk.studio/build</span></div><div className="p-5"><div className="mb-5 flex items-center justify-between"><div><p className="text-xs text-slate-500">Project aktif</p><h3 className="mt-1 font-bold">Katalog Bali</h3></div><Smartphone className="text-cyan"/></div><div className="rounded-xl border border-dashed border-cyan/30 bg-cyan/[.04] p-7 text-center"><UploadCloud className="mx-auto mb-3 text-cyan"/><p className="text-sm font-semibold">source-website.zip</p><p className="mt-1 text-xs text-slate-500">4.8 MB · siap dibangun</p></div><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-xl bg-white/[.035] p-4"><p className="text-[10px] uppercase tracking-wider text-slate-500">Package</p><p className="mt-2 truncate text-xs">id.bali.katalog</p></div><div className="rounded-xl bg-white/[.035] p-4"><p className="text-[10px] uppercase tracking-wider text-slate-500">Status</p><p className="mt-2 flex items-center gap-2 text-xs text-cyan"><i className="h-2 w-2 animate-pulse rounded-full bg-cyan"/>Building APK</p></div></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full w-3/4 rounded-full bg-gradient-to-r from-cyan to-violet"/></div></div></div></div>
  </section>
  <section id="fitur" className="mx-auto max-w-7xl px-6 py-24"><div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[.2em] text-cyan">Semua yang dibutuhkan</p><h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">Dari source ke smartphone.</h2></div><div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{features.map(([Icon,title,desc])=><div className="card p-6 transition hover:-translate-y-1 hover:border-cyan/25" key={title as string}><Icon className="text-cyan" size={24}/><h3 className="mt-5 font-bold">{title as string}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{desc as string}</p></div>)}</div></section>
  <footer className="border-t border-white/5 px-6 py-8"><div className="mx-auto flex max-w-7xl justify-between text-xs text-slate-600"><Logo/><span>© 2026 Web2APK Studio</span></div></footer>
 </main>;
}
