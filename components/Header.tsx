"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/map", label: "Map" },
  { href: "/species", label: "Species" },
  { href: "/prevention", label: "Prevention" },
  { href: "/activity", label: "Activity" },
];

export default function Header() {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenPath(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={open ? "site-header is-open" : "site-header"}>
      <Link href="/" className="brand" aria-label="Tick Tracker home">
        <Image
          src="/brand/elanco-logo.png"
          alt=""
          width={472}
          height={234}
          className="brand-logo"
          priority
        />
        <span className="brand-text">
          <span className="wordmark">Tick Tracker</span>
        </span>
      </Link>

      <button
        type="button"
        className="nav-toggle"
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpenPath(open ? null : pathname)}
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        <span className="nav-toggle-icon" aria-hidden="true" />
      </button>

      <div className="header-right" id="site-menu">
        <nav className="primary-nav" aria-label="Primary" onClick={() => setOpenPath(null)}>
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
