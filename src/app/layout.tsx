import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Footer } from "@/components/layout/footer";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { CalculatorThemeProvider } from "@/components/layout/calculator-theme-provider";
import dynamic from "next/dynamic";

// Only import analytics in production
const GoogleAnalytics = dynamic(() => 
  process.env.NODE_ENV === "production" 
    ? import("@/components/layout/google-analytics").then(mod => mod.GoogleAnalytics)
    : Promise.resolve(() => null)
);

// Dynamically import error boundary to avoid server/client mismatch
const ErrorBoundary = dynamic(() => 
  import("@/components/layout/error-boundary").then(mod => mod.ErrorBoundary)
);

// Dynamically import the performance indicator to avoid SSR issues
const PerformanceIndicator = dynamic(
  () => import('@/components/ui/performance-indicator').then(mod => mod.PerformanceIndicator)
);

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Calculate.ng | Nigerian Calculator Suite",
  description: "Your comprehensive Nigerian calculator suite featuring BMI, Tax, and Inflation calculators with beautiful themes and modern design.",
  keywords: "Nigerian calculator, BMI calculator, tax calculator, inflation calculator, Nigeria",
  authors: [{ name: "Calculate.ng Team" }],
  creator: "Calculate.ng",
  publisher: "Calculate.ng",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://calculate.ng"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Calculate.ng | Nigerian Calculator Suite",
    description: "Your comprehensive Nigerian calculator suite featuring BMI, Tax, and Inflation calculators",
    url: "https://calculate.ng",
    siteName: "Calculate.ng",
    locale: "en_NG",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Calculate.ng",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Calculate.ng | Nigerian Calculator Suite",
    description: "Your comprehensive Nigerian calculator suite featuring BMI, Tax, and Inflation calculators",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased`}
      >
        {process.env.NODE_ENV === "production" && <GoogleAnalytics />}
        {/* Skip to content link for keyboard users */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:p-2 focus:bg-background focus:text-primary focus:outline-ring"
        >
          Skip to content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CalculatorThemeProvider>            <div className="relative flex min-h-screen flex-col">
              <Header />            <div className="flex-1 flex">
                <Sidebar />
                <main id="main-content" className="flex-1" tabIndex={-1}>
                  <ErrorBoundary>
                    {children}
                  </ErrorBoundary>
                </main>
              </div>
              <Footer />
              {/* Only show in development */}
              {process.env.NODE_ENV === 'development' && <PerformanceIndicator />}
            </div>
          </CalculatorThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
