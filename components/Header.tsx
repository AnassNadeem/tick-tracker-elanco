"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Map" },
  { href: "/report", label: "Report" },
  { href: "/species", label: "Species" },
  { href: "/prevention", label: "Prevention" },
  { href: "/activity", label: "Activity" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="brand">
        <p className="eyebrow">UK tick sightings</p>
        <Link href="/" className="wordmark">
          Tick Tracker
        </Link>
      </div>
      <nav aria-label="Primary">
        <ul>
          {LINKS.map((link) => {
            const current = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link href={link.href} aria-current={current ? "page" : undefined}>
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
