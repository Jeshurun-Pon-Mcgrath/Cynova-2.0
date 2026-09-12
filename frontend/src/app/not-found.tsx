import Link from "next/link";
export default function NotFound(){return <main className="not-found"><div><strong>404</strong><h1>This path fades into the void.</h1><p className="muted">The quest or realm you were seeking cannot be found.</p><Link className="button button-primary" href="/dashboard">Return to command centre</Link></div></main>}
