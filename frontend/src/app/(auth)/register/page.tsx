import type { Metadata } from "next";
import { AuthScreen } from "@/features/auth/auth-screen";
export const metadata: Metadata = { title: "Create account" };
export default function RegisterPage(){return <AuthScreen mode="register"/>}
