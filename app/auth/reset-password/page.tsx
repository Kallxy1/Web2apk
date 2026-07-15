import type {Metadata} from "next";import {Logo} from "@/components/logo";import {NewPasswordForm} from "@/components/password-reset-forms";
export const metadata:Metadata={title:"Password Baru",robots:{index:false,follow:false}};
export default function Page(){return <main className="mesh min-h-screen"><nav className="mx-auto max-w-7xl px-6 py-6"><Logo/></nav><section className="grid place-items-center px-6 py-14"><NewPasswordForm/></section></main>}
