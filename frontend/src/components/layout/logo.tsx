import Link from "next/link";
import { Orbit } from "lucide-react";
export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="Cynova home">
      <span className="logo-mark" aria-hidden="true">
        <Orbit />
      </span>
      <span>CYNOVA</span>
    </Link>
  );
}
