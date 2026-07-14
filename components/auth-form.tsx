"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
export function AuthForm({ mode }: { mode: "login" | "register" }) {
 const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [message,setMessage]=useState(""); const [loading,setLoading]=useState(false); const router=useRouter();
 async function submit(e:React.FormEvent){e.preventDefault();setLoading(true);setMessage("");const sb=createClient();
  if(mode==="login"){const {error}=await sb.auth.signInWithPassword({email,password}); if(error)setMessage(error.message); else {router.push("/dashboard");router.refresh();}}
  else {const {error}=await sb.auth.signUp({email,password,options:{emailRedirectTo:`${location.origin}/auth/callback`}});setMessage(error?error.message:"Periksa email Anda untuk konfirmasi akun.");}
  setLoading(false);
 }
 return <form onSubmit={submit} className="card w-full max-w-md p-7 sm:p-9"><h1 className="text-2xl font-black">{mode==="login"?"Selamat datang kembali":"Buat akun baru"}</h1><p className="mt-2 text-sm text-slate-500">{mode==="login"?"Masuk untuk melanjutkan project Anda.":"Mulai build aplikasi Android pertama Anda."}</p><label className="mt-7 block"><span className="label">Email</span><input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="nama@email.com"/></label><label className="mt-4 block"><span className="label">Password</span><input className="input" type="password" minLength={8} value={password} onChange={e=>setPassword(e.target.value)} required placeholder="Minimal 8 karakter"/></label>{message&&<p className="mt-4 rounded-lg bg-white/5 p-3 text-xs text-amber-300">{message}</p>}<button className="btn-primary mt-6 w-full" disabled={loading}>{loading?<Loader2 className="animate-spin" size={17}/>:null}{mode==="login"?"Masuk":"Daftar akun"}</button><p className="mt-6 text-center text-xs text-slate-500">{mode==="login"?"Belum punya akun? ":"Sudah punya akun? "}<Link className="font-bold text-cyan" href={mode==="login"?"/register":"/login"}>{mode==="login"?"Daftar":"Masuk"}</Link></p></form>;
}
