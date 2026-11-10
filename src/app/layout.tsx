import type { Metadata, Viewport } from "next";
import { Geist, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { JsonLd } from "@/components/json-ld";
import { websiteSchema } from "@/lib/schema";
import { pages } from "@/lib/seo";
import { site } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});
const display = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: pages["/"].title, template: "%s | Calculate.ng" },
  description: pages["/"].description,
  applicationName: site.name,
  authors: [{ name: site.owner.name, url: site.owner.url }],
  creator: site.owner.name,
  publisher: site.owner.name,
  formatDetection: { email: false, address: false, telephone: false },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#07090d" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-NG" suppressHydrationWarning>
      <head>
        {/* Umami analytics (production only, so dev and test runs do not count as visits). */}
        {process.env.NODE_ENV === "production" && (
          <script
            defer
            src="https://umami.devchi.me/script.js"
            data-website-id="29903701-1888-492c-aa83-d09fa46af5c0"
          />
        )}
      </head>
      <body className={`${geistSans.variable} ${display.variable} antialiased`}>
        <JsonLd data={websiteSchema} />
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
          >
            Skip to content
          </a>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main id="main" className="flex-1">
              {children}
            </main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
