import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface CredentialItem {
  id: string;
  title: string;
  issuer: string;
  issuerUrl?: string | null;
  category: string;
  badge: string;
  certificateNo?: string | null;
  awardedDate?: string | null;
  issuedDate?: string | null;
  signatory: string;
  verificationUrl?: string | null;
  image: string;
  description: string;
}

export interface SupportingBundle {
  title: string;
  filename: string;
  url: string;
  pages: number;
  size: string;
}

interface CredentialsSectionProps {
  credentials: CredentialItem[];
  bundle?: SupportingBundle;
}

export function CredentialsSection({
  credentials,
  bundle,
}: CredentialsSectionProps) {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const selectedIndex = credentials.findIndex((c) => c.id === selectedDocId);
  const activeCred =
    selectedIndex >= 0 && selectedIndex < credentials.length
      ? credentials[selectedIndex] ?? null
      : null;

  const handleNext = useCallback(() => {
    if (selectedIndex === -1 || credentials.length === 0) return;
    const nextIdx = (selectedIndex + 1) % credentials.length;
    const nextItem = credentials[nextIdx];
    if (nextItem) setSelectedDocId(nextItem.id);
  }, [selectedIndex, credentials]);

  const handlePrev = useCallback(() => {
    if (selectedIndex === -1 || credentials.length === 0) return;
    const prevIdx = (selectedIndex - 1 + credentials.length) % credentials.length;
    const prevItem = credentials[prevIdx];
    if (prevItem) setSelectedDocId(prevItem.id);
  }, [selectedIndex, credentials]);

  // Keyboard navigation for modal
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!activeCred) return;
      if (e.key === "Escape") setSelectedDocId(null);
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };

    if (activeCred) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeCred, handleNext, handlePrev]);

  return (
    <section
      id="credentials"
      className="relative px-6 py-24 bg-muted/30 overflow-hidden"
    >
      {/* Background blueprint grid styling */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="mx-auto max-w-6xl w-full">
        {/* Section Header */}
        <div className="space-y-4 mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold tracking-wider uppercase backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Verified Background & Proof
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Institutional & Engineering Credentials
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">
            Certified qualifications, government-verifiable bachelor&apos;s
            degree, and executive engineering recognition from production
            platforms.
          </p>
        </div>

        {/* Official Supporting Dossier Download Banner */}
        {bundle && (
          <div className="mb-12 relative overflow-hidden rounded-2xl border border-border/80 bg-card/90 backdrop-blur-md p-6 shadow-sm">
            <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-start sm:items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground text-base sm:text-lg">
                      {bundle.title}
                    </h3>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {bundle.pages} Pages • {bundle.size} PDF
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Official bundle containing accredited CADT degree, BookMeBus
                    CTO appreciation, and ISTAD certificate.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  size="sm"
                  asChild
                  className="font-medium shadow-sm w-full sm:w-auto gap-2"
                >
                  <a
                    href={bundle.url}
                    download={bundle.filename}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" x2="12" y1="15" y2="3" />
                    </svg>
                    Download Dossier Bundle
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Credentials Grid: Archival Specimen Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {credentials.map((c) => (
            <div
              key={c.id}
              className="group relative flex flex-col rounded-2xl border border-border/80 bg-card/95 backdrop-blur-md overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300"
            >
              {/* Header Bar with Category and Verification Pill */}
              <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-border/50 bg-muted/20">
                <span className="text-[10px] font-mono tracking-wider text-muted-foreground uppercase">
                  {c.category}
                </span>
                {c.verificationUrl ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {c.badge}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-[10px] font-medium">
                    {c.badge}
                  </span>
                )}
              </div>

              {/* Specimen Preview Canvas */}
              <div
                onClick={() => setSelectedDocId(c.id)}
                className="relative cursor-pointer aspect-[1/1.28] bg-muted/40 p-4 flex items-center justify-center overflow-hidden border-b border-border/50 group/img"
                title="Click to inspect document"
              >
                {/* Corner crosshairs matching hero dossier style */}
                <span className="absolute top-2 left-2 text-[10px] font-mono text-muted-foreground/40 select-none z-10">
                  +
                </span>
                <span className="absolute top-2 right-2 text-[10px] font-mono text-muted-foreground/40 select-none z-10">
                  +
                </span>
                <span className="absolute bottom-2 left-2 text-[10px] font-mono text-muted-foreground/40 select-none z-10">
                  +
                </span>
                <span className="absolute bottom-2 right-2 text-[10px] font-mono text-muted-foreground/40 select-none z-10">
                  +
                </span>

                {/* Document paper preview */}
                <div className="relative w-full h-full rounded-lg overflow-hidden border border-border/70 bg-background shadow-md transition-transform duration-500 ease-out group-hover/img:scale-[1.02]">
                  <img
                    src={c.image}
                    alt={c.title}
                    className="w-full h-full object-cover object-top"
                    loading="lazy"
                  />
                  {/* Subtle hover overlay */}
                  <div className="absolute inset-0 bg-background/60 opacity-0 group-hover/img:opacity-100 backdrop-blur-[2px] transition-opacity duration-200 flex flex-col items-center justify-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" x2="16.65" y1="21" y2="16.65" />
                        <line x1="11" x2="11" y1="8" y2="14" />
                        <line x1="8" x2="14" y1="11" y2="11" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-foreground tracking-wide">
                      Inspect Document
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Meta Body */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-foreground text-base sm:text-lg mb-1 leading-snug">
                  {c.title}
                </h3>
                <p className="text-sm font-medium text-primary mb-3">
                  {c.issuerUrl ? (
                    <a
                      href={c.issuerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline underline-offset-4 inline-flex items-center gap-1"
                    >
                      {c.issuer}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-70"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" x2="21" y1="14" y2="3" />
                      </svg>
                    </a>
                  ) : (
                    c.issuer
                  )}
                </p>

                <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">
                  {c.description}
                </p>

                {/* Technical Stamps Strip */}
                <div className="rounded-lg bg-muted/40 border border-border/50 p-2.5 mb-4 text-[11px] font-mono space-y-1 text-muted-foreground">
                  {c.certificateNo && (
                    <div className="flex justify-between">
                      <span>REF / CERT NO:</span>
                      <span className="font-semibold text-foreground">
                        {c.certificateNo}
                      </span>
                    </div>
                  )}
                  {c.signatory && (
                    <div className="flex justify-between">
                      <span>SIGNATORY:</span>
                      <span className="text-foreground text-right truncate max-w-[160px]">
                        {c.signatory}
                      </span>
                    </div>
                  )}
                  {c.issuedDate && (
                    <div className="flex justify-between">
                      <span>ISSUED:</span>
                      <span className="text-foreground">{c.issuedDate}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 mt-auto pt-2 border-t border-border/50">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDocId(c.id)}
                    className="flex-1 text-xs gap-1.5"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    Inspect
                  </Button>

                  {c.verificationUrl && (
                    <Button
                      size="sm"
                      variant="default"
                      asChild
                      className="flex-1 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <a
                        href={c.verificationUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                          <path d="m9 12 2 2 4-4" />
                        </svg>
                        verify.gov.kh
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Document Lightbox Modal */}
      {activeCred && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-background/80 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setSelectedDocId(null)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs font-mono">
                  {selectedIndex + 1} / {credentials.length}
                </Badge>
                <div>
                  <h3 className="font-semibold text-foreground text-sm sm:text-base line-clamp-1">
                    {activeCred.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {activeCred.issuer}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDocId(null)}
                  className="h-8 w-8 p-0 rounded-full"
                  aria-label="Close modal"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </Button>
              </div>
            </div>

            {/* Modal Image Viewport */}
            <div className="relative flex-1 overflow-auto p-4 sm:p-6 bg-muted/20 flex items-center justify-center min-h-[400px]">
              <img
                src={activeCred.image}
                alt={activeCred.title}
                className="max-h-[68vh] w-auto object-contain rounded-lg border border-border shadow-md"
              />

              {/* Left/Right Navigation Arrows */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/90 border border-border shadow-md flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                aria-label="Previous document"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/90 border border-border shadow-md flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                aria-label="Next document"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            {/* Modal Footer Strip */}
            <div className="px-6 py-3.5 border-t border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-muted-foreground text-center sm:text-left">
                {activeCred.certificateNo && (
                  <span className="font-mono mr-3">
                    Ref: {activeCred.certificateNo}
                  </span>
                )}
                <span>Signatory: {activeCred.signatory}</span>
              </div>
              <div className="flex items-center gap-2">
                {activeCred.verificationUrl && (
                  <Button
                    size="sm"
                    asChild
                    className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                  >
                    <a
                      href={activeCred.verificationUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                      Verify on verify.gov.kh
                    </a>
                  </Button>
                )}
                {bundle && (
                  <Button size="sm" variant="outline" asChild className="h-8 text-xs gap-1.5">
                    <a
                      href={bundle.url}
                      download={bundle.filename}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Download Dossier PDF
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
