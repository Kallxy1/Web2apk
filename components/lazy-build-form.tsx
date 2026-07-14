"use client";
import dynamic from "next/dynamic";
const BuildForm=dynamic(()=>import("./build-form").then(m=>m.BuildForm),{ssr:false,loading:()=> <div className="mt-8 border border-white/[.08] p-7"><div className="skeleton h-14 w-full"/><div className="skeleton mt-7 h-72 w-full"/><p className="mt-5 text-center text-[9px] uppercase tracking-widest text-zinc-700">Memuat APK builder…</p></div>});
export function LazyBuildForm(){return <BuildForm/>}
