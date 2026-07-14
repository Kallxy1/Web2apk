import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Web2APK Studio — Ubah Web Menjadi APK",
  description: "Build aplikasi Android dari URL atau file HTML dengan cepat.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
