import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ThemeProvider } from "../components/theme-provider";
import { AutoScrollDemo } from "./auto-scroll-demo";
import "./globals.css";

// GitHub Pages cannot set HTTP response headers, so CSP ships as a meta tag.
// Note: frame-ancestors is ignored in meta CSP — clickjacking protection is
// not available on GitHub Pages (see docs/security.md).
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://plausible.io",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self' https://plausible.io",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

export const metadata: Metadata = {
  title: "Sambath - Software Engineer | Flutter & React Developer",
  description:
    "Sambath is a Software Engineer specializing in Flutter and React development.",
  referrer: "strict-origin-when-cross-origin",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta httpEquiv="Content-Security-Policy" content={csp} />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AutoScrollDemo>{children}</AutoScrollDemo>
        </ThemeProvider>
      </body>
    </html>
  );
}
