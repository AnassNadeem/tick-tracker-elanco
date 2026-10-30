import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import Header from "@/components/Header";
import Providers from "@/components/Providers";
import SkipLink from "@/components/SkipLink";
import { Suspense } from "react";
import "./globals.css";

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source",
});

const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: {
    default: "Tick Tracker",
    template: "%s · Tick Tracker",
  },
  description: "Map, report, and learn about tick sightings across the UK.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <Providers>
          <SkipLink />
          <Suspense fallback={null}>
            <Header />
          </Suspense>
          <main id="main">{children}</main>
          <footer className="site-footer">
            A placement-task project by Anass Nadeem. Not an official Elanco service. Records
            describe sightings for this exercise and are not a veterinary or medical diagnosis.
          </footer>
        </Providers>
      </body>
    </html>
  );
}
