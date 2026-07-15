export type PlanId="free"|"pro"|"business";
export const PLANS={
 free:{name:"Free",dailyBuilds:3,maxUploadMb:25,retentionDays:7,price:"Rp0",features:["3 build baru per hari","APK siap install","Source hingga 25 MB","Retensi 7 hari"]},
 pro:{name:"Pro",dailyBuilds:30,maxUploadMb:100,retentionDays:30,price:"Rp79.000",features:["30 build baru per hari","Update aplikasi tanpa batas","Edit ulang seluruh konfigurasi","Reuse source dan icon lama","Production signing","Retensi 30 hari"]},
 business:{name:"Business",dailyBuilds:100,maxUploadMb:250,retentionDays:90,price:"Rp249.000",features:["100 build baru per hari","Update aplikasi tanpa batas","Semua custom capability","Retensi 90 hari","Priority support","Team-ready"]},
} as const;
export function isPlan(value:unknown):value is PlanId{return value==="free"||value==="pro"||value==="business"}
