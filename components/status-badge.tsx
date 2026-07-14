import type { BuildStatus } from "@/lib/types";
const styles:Record<BuildStatus,string>={queued:"bg-amber-400/10 text-amber-300",building:"bg-blue-400/10 text-blue-300",success:"bg-emerald-400/10 text-emerald-300",failed:"bg-red-400/10 text-red-300"};
const labels:Record<BuildStatus,string>={queued:"Antrean",building:"Diproses",success:"Selesai",failed:"Gagal"};
export function StatusBadge({status}:{status:BuildStatus}){return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${styles[status]}`}>{labels[status]}</span>}
