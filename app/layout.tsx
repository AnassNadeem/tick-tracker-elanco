import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tick Tracker",
  description: "Map, report, and learn about tick sightings across the UK.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <main id="main">{children}</main>
      </body>
    </html>
  );
}
