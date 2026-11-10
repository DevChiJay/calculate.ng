"use client";

import { ThemeProvider } from "next-themes";

/** Dark by default (the studio look); light and system are one tap away via the theme toggle. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}
