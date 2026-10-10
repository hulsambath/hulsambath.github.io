import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "QR Code Generator | Sambath HUL",
  description: "Generate QR codes for links, text, Wi‑Fi and email — entirely in your browser.",
  robots: { index: false, follow: false },
};

export default function GenerateQrLayout({ children }: { children: ReactNode }) {
  return children;
}
