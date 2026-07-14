export type PlanId="free"|"pro"|"business";
export const PLANS={
 free:{name:"Free",dailyBuilds:3,maxUploadMb:25,retentionDays:7,price:"Rp0",features:["3 build per hari","APK + AAB","Source hingga 25 MB","Retensi 7 hari"]},
 pro:{name:"Pro",dailyBuilds:30,maxUploadMb:100,retentionDays:30,price:"Rp79.000",features:["30 build per hari","Source hingga 100 MB","Production signing","Retensi 30 hari","Prioritas antrean"]},
 business:{name:"Business",dailyBuilds:100,maxUploadMb:250,retentionDays:90,price:"Rp249.000",features:["100 build per hari","Source hingga 250 MB","Retensi 90 hari","Priority support","Team-ready"]},
} as const;
export function isPlan(value:unknown):value is PlanId{return value==="free"||value==="pro"||value==="business"}
