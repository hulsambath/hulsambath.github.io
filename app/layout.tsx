import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ThemeProvider } from "../components/theme-provider";
import { AutoScrollDemo } from "./auto-scroll-demo";
import "./globals.css";

// GitHub Pages cannot set HTTP response headers, so CSP ships as a meta tag.
// Note: frame-ancestors is ignored in meta CSP — clickjacking protection is
// not available on GitHub Pages (see docs/security.md).
// React dev mode needs eval() for its debugging features (never in prod
// builds), so 'unsafe-eval' is granted only on the dev server.
const devEval = process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://plausible.io${devEval}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  // team logos on /predictor come from ESPN's and 1xbet's CDNs
  "img-src 'self' data: https://a.espncdn.com https://v2l.traincdn.com",
  // predictor page talks to the football-predictor API (REST + WebSocket);
  // localhost entries cover local dev against the same page.
  "connect-src 'self' https://plausible.io https://predictor-api.hulsambath.me wss://predictor-api.hulsambath.me http://localhost:8000 ws://localhost:8000",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

export const metadata: Metadata = {
  title: "Sambath HUL - Software Engineer | Mobile, Web & Developer Tooling",
  description:
    "Sambath HUL is a Software Engineer specializing in cross-platform mobile apps (Flutter), web development (React/Next.js), and developer tooling.",
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
