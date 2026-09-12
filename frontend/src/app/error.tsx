"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({reset}:{error:Error&{digest?:string};reset:()=>void}){return <main className="not-found"><div><strong>!</strong><h1>The realm lost its signal.</h1><p className="muted">Your progress is safe. Reopen this view to try again.</p><Button onClick={reset}>Try again</Button></div></main>}
