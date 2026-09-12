import type { Metadata } from "next";
import { AuthScreen } from "@/features/auth/auth-screen";
export const metadata: Metadata = { title: "Recover account" };
export default function ForgotPasswordPage(){return <AuthScreen mode="forgot"/>}
