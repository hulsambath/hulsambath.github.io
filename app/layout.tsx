import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ThemeProvider } from "../components/theme-provider";
import { AutoScrollDemo } from "./auto-scroll-demo";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sambath - Software Engineer | Flutter & React Developer",
  description:
    "Sambath is a Software Engineer specializing in Flutter and React development.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AutoScrollDemo>{children}</AutoScrollDemo>
        </ThemeProvider>
      </body>
    </html>
  );
}
