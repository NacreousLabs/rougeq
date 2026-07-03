import type { Metadata } from "next";
import { Geist, Geist_Mono, Oswald } from "next/font/google";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

// Apply the saved/system theme before paint to avoid a flash of the wrong theme.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Condensed "scoreboard" display face for headings and stat values (Broadcast
// styling). Exposed as --font-oswald → the `font-display` Tailwind utility.
const oswald = Oswald({
  variable: "--font-oswald",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rougeq.ca"),
  title: "RougeQ — Winnipeg Blue Bombers analytics",
  description: "Advanced analytics, schedule, roster, and history for the Winnipeg Blue Bombers.",
  openGraph: {
    title: "RougeQ — Winnipeg Blue Bombers analytics",
    description: "Advanced analytics, schedule, roster, and history for the Winnipeg Blue Bombers.",
    siteName: "RougeQ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RougeQ — Winnipeg Blue Bombers analytics",
    description: "Advanced analytics, schedule, roster, and history for the Winnipeg Blue Bombers.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <SiteNav />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
