"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    gtag?: (command: string, ...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

// Falls back to the existing property so analytics keep working until the env var is set on the host.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-RJTPPH78Y6";

export function GoogleAnalytics() {
  const pathname = usePathname();
  const first = useRef(true);

  // The init script already records the first page view; only count later route changes.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    window.gtag?.("config", GA_ID, { page_path: pathname });
  }, [pathname]);

  return (
    <>
      <Script strategy="lazyOnload" src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
      <Script id="gtag-init" strategy="lazyOnload">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
      </Script>
    </>
  );
}
