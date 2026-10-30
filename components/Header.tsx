"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/map", label: "Map" },
  { href: "/species", label: "Species" },
  { href: "/prevention", label: "Prevention" },
  { href: "/activity", label: "Activity" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="Tick Tracker home">
        <span className="brand-mark" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <rect
              x="13"
              y="0.5"
              width="17"
              height="17"
              rx="3"
              transform="rotate(45 13 0.5)"
              fill="currentColor"
            />
            <circle cx="13" cy="13" r="3.4" fill="#fff" />
          </svg>
        </span>
        <span className="brand-text">
          <span className="eyebrow">Elanco · UK tick sightings</span>
          <span className="wordmark">Tick Tracker</span>
        </span>
      </Link>

      <div className="header-right">
        <nav className="primary-nav" aria-label="Primary">
          <ul>
            {LINKS.map((link) => {
              const current = pathname === link.href || pathname.startsWith(`${link.href}/`);
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
        <Link href="/report" className="btn btn-accent header-cta">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
          Report a sighting
        </Link>
      </div>
    </header>
  );
}
