import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import Footer from "@/components/Footer";
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
    default: "Tick Tracker · UK tick sightings",
    template: "%s · Tick Tracker",
  },
  description:
    "Map, report, and learn about tick sightings across the UK. An Elanco-inspired preventive-care tracker.",
};

export const viewport = {
  themeColor: "#0070c8",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`} data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        <Providers>
          <SkipLink />
          <Suspense fallback={null}>
            <Header />
          </Suspense>
          <main id="main">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
