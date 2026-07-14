import Link from "next/link";
export function Logo() {
  return <Link href="/" className="flex items-center gap-3 font-extrabold tracking-tight">
    <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan to-violet text-ink shadow-glow">W</span>
    <span>Web2APK<span className="text-cyan">.</span></span>
  </Link>;
}
