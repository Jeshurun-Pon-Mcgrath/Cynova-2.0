"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { DemoRealmButton } from "@/components/auth/demo-realm-button";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { mockAuthService, mockGameService } from "@/services/mock/game-service";
import { gameQueryKey } from "@/lib/query/game-query";

type Mode = "login" | "register" | "forgot";
const copy = { login: ["Return to your realm", "Your quests and Nova Core are waiting."], register: ["Create your character", "Begin with a name. Build the legend one quest at a time."], forgot: ["Recover your realm", "We'll send a secure recovery link if the account exists."] } as const;
const schema = z.object({ name: z.string().trim().max(40).optional(), email: z.email("Enter a valid email address."), password: z.string().optional() });
type Values = z.infer<typeof schema>;

export function AuthScreen({ mode }: { mode: Mode }) {
  const router = useRouter(); const submitting = useRef(false);
  const client = useQueryClient();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { name: "", email: "", password: "" } });
  const validatedSubmit = handleSubmit(async (values) => {
    if (mode === "register" && (!values.name || values.name.trim().length < 2)) { setError("name", { message: "Player name must be at least 2 characters." }); return; }
    if (mode !== "forgot" && (!values.password || values.password.length < 8)) { setError("password", { message: "Password must be at least 8 characters." }); return; }
    try {
      if (mode === "forgot") { await new Promise((resolve) => setTimeout(resolve, 300)); toast.success("Recovery instructions are on their way."); }
      else if (mode === "register") { await mockAuthService.register(values.name!.trim(), values.email, values.password!); client.setQueryData(gameQueryKey, await mockGameService.getSnapshot()); toast.success("Your realm is ready to awaken."); router.push("/onboarding"); }
      else { await mockAuthService.signIn(values.email, values.password!); client.setQueryData(gameQueryKey, await mockGameService.getSnapshot()); toast.success("Welcome back, adventurer."); router.push("/dashboard"); }
    } catch { toast.error("The realm could not verify those details."); }
  });
  const submit = (event: FormEvent<HTMLFormElement>) => { if (submitting.current) { event.preventDefault(); return; } submitting.current = true; void validatedSubmit(event).finally(() => { submitting.current = false; }); };
  return <main className="auth-page"><section className="auth-art" aria-label="Cynova welcome"><Logo/><p className="auth-quote">“Every legendary life is built from ordinary days used well.”</p><p className="muted">CYNOVA · LIFE RPG</p></section><section className="auth-form-wrap"><div className="auth-form"><Logo/><h1>{copy[mode][0]}</h1><p>{copy[mode][1]}</p><form onSubmit={submit} noValidate>{mode === "register" && <AuthField id="name" label="Player name" error={errors.name?.message}><input id="name" autoComplete="name" {...register("name")}/></AuthField>}<AuthField id="email" label="Email address" error={errors.email?.message}><input id="email" type="email" autoComplete="email" placeholder="arin@example.com" {...register("email")}/></AuthField>{mode !== "forgot" && <AuthField id="password" label="Password" error={errors.password?.message}><input id="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} {...register("password")}/></AuthField>}<Button disabled={isSubmitting} type="submit">{isSubmitting ? "Opening portal…" : mode === "login" ? "Enter your realm" : mode === "register" ? "Create account" : "Send recovery link"}<ArrowRight/></Button></form><div className="auth-links">{mode === "login" ? <><Link href="/forgot-password">Forgot password?</Link><Link href="/register">Create account</Link></> : <Link href="/login">Return to login</Link>}<DemoRealmButton className="auth-demo-link"/></div><p className="muted auth-disclaimer">Phase 1 demo authentication is for evaluation and is not production security.</p></div></section></main>;
}

function AuthField({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) { return <div className="field"><label htmlFor={id}>{label}</label>{children}{error && <span className="field-error" role="alert">{error}</span>}</div>; }
